"""Backtest API endpoints."""

import asyncio
import random
import uuid
from datetime import date, datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.core.jobs import create_job, get_job, update_job, set_job_result, set_job_failed, JobStatus
from app.providers.factory import get_provider
from app.providers.base import AssetClass
from app.backtest.vectorbt_engine import run_backtest, trades_to_records, VBT_AVAILABLE
from app.backtest.analytics import (
    compute_metrics,
    compute_metrics_with_benchmark,
    compute_drawdown_series,
    compute_top_drawdowns,
    compute_monthly_returns,
)

router = APIRouter()


# ─── In-memory storage ───

_pinned_results: dict[str, dict] = {}  # result_id -> result data
_library: dict[str, dict] = {}  # entry_id -> library entry
_backtest_results: dict[str, dict] = {}  # result_id -> full result for trades endpoint


@router.get("/benchmarks/list")  # Must be before /{run_id}
async def list_benchmarks():
    """List available benchmarks (buy-and-hold comparison)."""
    return {
        "benchmarks": [
            {"id": "SPY", "name": "S&P 500 (SPY)", "symbol": "SPY"},
            {"id": "QQQ", "name": "NASDAQ 100 (QQQ)", "symbol": "QQQ"},
            {"id": "IWM", "name": "Russell 2000 (IWM)", "symbol": "IWM"},
            {"id": "DIA", "name": "Dow Jones (DIA)", "symbol": "DIA"},
            {"id": "VTI", "name": "US Total Market (VTI)", "symbol": "VTI"},
        ]
    }


class BacktestRequest(BaseModel):
    """Backtest run request."""

    symbol: str
    start: date
    end: date
    interval: str = "1d"
    maker_fee_bps: float = 0
    taker_fee_bps: float = 0
    benchmark: str | None = None
    fast_period: int = 10
    slow_period: int = 30


async def _fetch_and_prepare(req_symbol: str, req_start: date, req_end: date, req_interval: str):
    """Fetch OHLCV data and prepare close series."""
    provider = get_provider(None)
    df = await provider.get_historical(req_symbol, req_start, req_end, req_interval)
    if not df.empty and "close" not in df.columns:
        cols = {"Close": "close", "Open": "open", "High": "high", "Low": "low", "Volume": "volume"}
        df = df.rename(columns=cols)
    if df.empty:
        return None, None
    ohlcv = df.set_index("bucket")[["open", "high", "low", "close", "volume"]] if "bucket" in df.columns else df[["open", "high", "low", "close", "volume"]]
    ohlcv = ohlcv.rename(columns=str.lower)
    close = ohlcv["close"]
    return ohlcv, close


def _generate_signals(close, fast_period: int, slow_period: int):
    """Generate SMA crossover entry/exit signals."""
    try:
        fast = close.rolling(fast_period).mean()
        slow = close.rolling(slow_period).mean()
        entries = (fast > slow) & (fast.shift(1) <= slow.shift(1))
        exits = (fast < slow) & (fast.shift(1) >= slow.shift(1))
    except Exception:
        entries = close > close.shift(1)
        exits = close < close.shift(1)
    return entries, exits


@router.post("/run")
async def run_backtest_request(req: BacktestRequest):
    """Run backtest - returns job_id. Poll GET /jobs/{id} for result."""
    job_id = create_job("backtest")

    async def _run():
        try:
            update_job(job_id, status=JobStatus.RUNNING, progress=10)

            ohlcv, close = await _fetch_and_prepare(req.symbol, req.start, req.end, req.interval)
            if ohlcv is None:
                set_job_failed(job_id, "No data returned")
                return

            update_job(job_id, progress=30)

            entries, exits = _generate_signals(close, req.fast_period, req.slow_period)

            result = run_backtest(
                ohlcv,
                entries.reindex(ohlcv.index).fillna(False),
                exits.reindex(ohlcv.index).fillna(False),
                req.maker_fee_bps,
                req.taker_fee_bps,
            )

            update_job(job_id, progress=60)

            trades_list = trades_to_records(result.trades, req.symbol)

            # Compute full metrics using analytics module
            strategy_equity = result.equity_curve.dropna()
            benchmark_returns = None

            # Build benchmark curve
            benchmark_curve: dict[str, float] = {}
            if req.benchmark and req.benchmark.strip():
                try:
                    provider = get_provider(None)
                    bench_df = await provider.get_historical(req.benchmark.strip(), req.start, req.end, req.interval)
                    if not bench_df.empty:
                        if "close" not in bench_df.columns and "Close" in bench_df.columns:
                            bench_df = bench_df.rename(columns={"Close": "close", "Open": "open", "High": "high", "Low": "low", "Volume": "volume"})
                        bench_close = bench_df.set_index("bucket")["close"] if "bucket" in bench_df.columns else bench_df["close"]
                        bench_close = bench_close.dropna()
                        if not bench_close.empty and len(strategy_equity) > 0:
                            benchmark_returns = bench_close.pct_change().dropna()
                            initial_strategy = float(strategy_equity.iloc[0])
                            bench_return = bench_close / bench_close.iloc[0]
                            bench_aligned = bench_return.reindex(strategy_equity.index).ffill().bfill()
                            bc = bench_aligned.dropna().mul(initial_strategy).astype(float)
                            benchmark_curve = {str(k)[:10]: float(v) for k, v in bc.items()}
                except Exception:
                    pass

            update_job(job_id, progress=80)

            # Compute metrics with benchmark info
            metrics = compute_metrics_with_benchmark(
                strategy_equity, trades_list, benchmark_returns
            )

            # Build equity curve dict
            strategy_curve = {str(k)[:10]: float(v) for k, v in strategy_equity.astype(float).items()} if not strategy_equity.empty else {}

            # Compute drawdown series, top drawdowns, and monthly returns
            drawdown_series = compute_drawdown_series(strategy_equity)
            top_drawdowns = compute_top_drawdowns(strategy_equity)
            monthly_returns = compute_monthly_returns(strategy_equity)

            result_id = job_id
            result_data = {
                "symbol": req.symbol,
                "benchmark": req.benchmark or "",
                "metrics": metrics,
                "equity_curve": strategy_curve,
                "benchmark_curve": benchmark_curve,
                "trades_count": len(trades_list),
                "trades": trades_list,
                "drawdown_series": drawdown_series,
                "top_drawdowns": top_drawdowns,
                "monthly_returns": monthly_returns,
                "config": {
                    "strategy_type": "sma_crossover",
                    "strategy_config": {
                        "fast_period": req.fast_period,
                        "slow_period": req.slow_period,
                    },
                    "assets": [req.symbol],
                    "date_range": {
                        "start": str(req.start),
                        "end": str(req.end),
                    },
                    "interval": req.interval,
                    "benchmark": req.benchmark or "",
                    "fees": {
                        "maker_bps": req.maker_fee_bps,
                        "taker_bps": req.taker_fee_bps,
                    },
                },
            }

            # Store for trades endpoint
            _backtest_results[result_id] = result_data

            set_job_result(job_id, result_data)
        except Exception as e:
            set_job_failed(job_id, str(e))

    asyncio.create_task(_run())
    return {"job_id": job_id}


# ─── Pinning ───

@router.get("/pinned")
async def get_pinned_results():
    """Get pinned backtest results."""
    return list(_pinned_results.values())


@router.get("/results/pinned")
async def get_pinned_results_alias():
    """Get pinned backtest results (alias)."""
    return list(_pinned_results.values())


@router.post("/results/{result_id}/pin")
async def pin_result(result_id: str):
    """Pin a result."""
    # Store a reference; the frontend sends the full result data
    if result_id not in _pinned_results:
        # Try to get from stored results
        stored = _backtest_results.get(result_id)
        _pinned_results[result_id] = stored or {"id": result_id}
    return {"status": "pinned"}


@router.delete("/results/{result_id}/pin")
async def unpin_result(result_id: str):
    """Unpin a result."""
    _pinned_results.pop(result_id, None)
    return {"status": "unpinned"}


# ─── Trades endpoint ───

@router.get("/results/{result_id}/trades")
async def get_result_trades(result_id: str, page: int = 1, per_page: int = 50):
    """Get trades for a backtest result with pagination."""
    stored = _backtest_results.get(result_id)
    if not stored:
        raise HTTPException(status_code=404, detail="Result not found")
    all_trades = stored.get("trades", [])
    start = (page - 1) * per_page
    end = start + per_page
    return {
        "trades": all_trades[start:end],
        "total": len(all_trades),
        "page": page,
        "per_page": per_page,
    }


# ─── Optimizer ───

class OptimizeRequest(BaseModel):
    """Optimizer request."""
    strategy_id: str | None = None
    strategy_config_overrides: dict = {}
    assets: list[str] = ["SPY"]
    date_range: dict = {"start": "2023-01-01", "end": "2024-01-01"}
    interval: str = "1d"
    benchmark: str = ""
    fees: dict = {"maker_bps": 0, "taker_bps": 0}
    optimization: dict = {}


@router.post("/optimize")
async def run_optimizer(body: OptimizeRequest):
    """Parameter optimization - runs grid search over parameter ranges."""
    job_id = create_job("backtest_optimize")

    async def _run():
        try:
            update_job(job_id, status=JobStatus.RUNNING, progress=5)

            opt_config = body.optimization
            target_metric = opt_config.get("target_metric", "sharpe_ratio")
            parameters = opt_config.get("parameters", [])

            if not parameters:
                set_job_failed(job_id, "No parameters specified for optimization")
                return

            # Build parameter grid
            param_values: list[list[tuple[str, Any]]] = []
            for p in parameters:
                key = p.get("key", "")
                if p.get("type") == "range":
                    from_val = p.get("from", 10)
                    to_val = p.get("to", 100)
                    step = p.get("step", 10)
                    vals = []
                    v = from_val
                    while v <= to_val:
                        vals.append((key, v))
                        v += step
                    param_values.append(vals)
                elif p.get("type") == "enum":
                    vals = [(key, v) for v in (p.get("values") or [])]
                    param_values.append(vals)

            if not param_values:
                set_job_failed(job_id, "No valid parameter values to sweep")
                return

            # Generate all combinations
            import itertools
            combinations = list(itertools.product(*param_values))
            total = len(combinations)
            if total > 500:
                combinations = combinations[:500]
                total = 500

            symbol = body.assets[0] if body.assets else "SPY"
            start_date = date.fromisoformat(body.date_range.get("start", "2023-01-01"))
            end_date = date.fromisoformat(body.date_range.get("end", "2024-01-01"))

            # Fetch data once
            ohlcv, close = await _fetch_and_prepare(symbol, start_date, end_date, body.interval)
            if ohlcv is None:
                set_job_failed(job_id, "No data returned for optimization")
                return

            grid: list[dict] = []
            maker_fee = body.fees.get("maker_bps", 0)
            taker_fee = body.fees.get("taker_bps", 0)

            for i, combo in enumerate(combinations):
                params_dict = {k: v for k, v in combo}

                # Apply params to strategy config
                fast_p = int(params_dict.get("fast_period", body.strategy_config_overrides.get("fast_period", 10)))
                slow_p = int(params_dict.get("slow_period", body.strategy_config_overrides.get("slow_period", 30)))

                entries, exits = _generate_signals(close, fast_p, slow_p)

                bt_result = run_backtest(
                    ohlcv,
                    entries.reindex(ohlcv.index).fillna(False),
                    exits.reindex(ohlcv.index).fillna(False),
                    maker_fee,
                    taker_fee,
                )

                equity = bt_result.equity_curve.dropna()
                trades_list = trades_to_records(bt_result.trades, symbol)
                metrics = compute_metrics(equity, trades_list)

                cell_result_id = str(uuid.uuid4())
                _backtest_results[cell_result_id] = {
                    "symbol": symbol,
                    "metrics": metrics,
                    "equity_curve": {str(k)[:10]: float(v) for k, v in equity.astype(float).items()} if not equity.empty else {},
                    "benchmark_curve": {},
                    "trades": trades_list,
                    "trades_count": len(trades_list),
                    "drawdown_series": compute_drawdown_series(equity),
                    "top_drawdowns": compute_top_drawdowns(equity),
                    "monthly_returns": compute_monthly_returns(equity),
                    "config": {
                        "strategy_type": "sma_crossover",
                        "strategy_config": params_dict,
                        "assets": [symbol],
                        "date_range": body.date_range,
                        "interval": body.interval,
                        "benchmark": body.benchmark,
                        "fees": body.fees,
                    },
                }

                grid.append({
                    "param_values": params_dict,
                    "metrics": metrics,
                    "result_id": cell_result_id,
                })

                progress = int(5 + 90 * (i + 1) / total)
                update_job(job_id, progress=progress, result={"partial_results": grid[-10:]})

            # Sort grid by target metric and pick top N
            def metric_val(cell: dict) -> float:
                m = cell.get("metrics", {})
                val = m.get(target_metric, 0)
                # For max_drawdown, less negative is better
                if target_metric == "max_drawdown":
                    return -abs(val)
                return val

            sorted_grid = sorted(grid, key=metric_val, reverse=True)
            top_n = sorted_grid[:10]

            set_job_result(job_id, {
                "id": job_id,
                "target_metric": target_metric,
                "parameters": parameters,
                "grid": grid,
                "top_n": top_n,
                "total_combinations": total,
                "completed_combinations": len(grid),
            })
        except Exception as e:
            set_job_failed(job_id, str(e))

    asyncio.create_task(_run())
    return {"job_id": job_id}


# ─── Walk-Forward ───

class WalkForwardRequest(BaseModel):
    """Walk-forward analysis request."""
    strategy_id: str | None = None
    strategy_config: dict = {}
    assets: list[str] = ["SPY"]
    date_range: dict = {"start": "2022-01-01", "end": "2025-01-01"}
    interval: str = "1d"
    benchmark: str = ""
    fees: dict = {"maker_bps": 0, "taker_bps": 0}
    walk_forward: dict = {}


@router.post("/walk-forward")
async def run_walk_forward(body: WalkForwardRequest):
    """Walk-forward analysis - rolling/expanding window optimization and testing."""
    job_id = create_job("backtest_walk_forward")

    async def _run():
        import pandas as pd
        try:
            update_job(job_id, status=JobStatus.RUNNING, progress=5)

            wf = body.walk_forward
            window_type = wf.get("window_type", "rolling")
            is_days = int(wf.get("in_sample_days", 252))
            oos_days = int(wf.get("out_of_sample_days", 63))
            step_days = int(wf.get("step_days", 63))

            symbol = body.assets[0] if body.assets else "SPY"
            start_date = date.fromisoformat(body.date_range.get("start", "2022-01-01"))
            end_date = date.fromisoformat(body.date_range.get("end", "2025-01-01"))

            ohlcv, close = await _fetch_and_prepare(symbol, start_date, end_date, body.interval)
            if ohlcv is None:
                set_job_failed(job_id, "No data returned for walk-forward")
                return

            total_bars = len(close)
            maker_fee = body.fees.get("maker_bps", 0)
            taker_fee = body.fees.get("taker_bps", 0)
            fast_p = int(body.strategy_config.get("fast_period", 10))
            slow_p = int(body.strategy_config.get("slow_period", 30))

            # Generate windows
            windows: list[dict] = []
            combined_oos_equity: list[dict] = []
            window_num = 0
            pos = 0

            while pos + is_days + oos_days <= total_bars:
                window_num += 1
                if window_type == "rolling":
                    is_start = pos
                    is_end = pos + is_days
                else:  # expanding
                    is_start = 0
                    is_end = pos + is_days

                oos_start = is_end
                oos_end = min(is_end + oos_days, total_bars)

                # In-sample backtest
                is_ohlcv = ohlcv.iloc[is_start:is_end]
                is_close = close.iloc[is_start:is_end]
                is_entries, is_exits = _generate_signals(is_close, fast_p, slow_p)
                is_bt = run_backtest(is_ohlcv, is_entries.reindex(is_ohlcv.index).fillna(False), is_exits.reindex(is_ohlcv.index).fillna(False), maker_fee, taker_fee)
                is_equity = is_bt.equity_curve.dropna()
                is_trades = trades_to_records(is_bt.trades, symbol)
                is_metrics = compute_metrics(is_equity, is_trades)

                # Out-of-sample backtest
                oos_ohlcv = ohlcv.iloc[oos_start:oos_end]
                oos_close = close.iloc[oos_start:oos_end]
                oos_entries, oos_exits = _generate_signals(oos_close, fast_p, slow_p)
                oos_bt = run_backtest(oos_ohlcv, oos_entries.reindex(oos_ohlcv.index).fillna(False), oos_exits.reindex(oos_ohlcv.index).fillna(False), maker_fee, taker_fee)
                oos_equity = oos_bt.equity_curve.dropna()
                oos_trades = trades_to_records(oos_bt.trades, symbol)
                oos_metrics = compute_metrics(oos_equity, oos_trades)

                oos_result_id = str(uuid.uuid4())
                _backtest_results[oos_result_id] = {
                    "symbol": symbol,
                    "metrics": oos_metrics,
                    "equity_curve": {str(k)[:10]: float(v) for k, v in oos_equity.astype(float).items()} if not oos_equity.empty else {},
                    "trades": oos_trades,
                    "trades_count": len(oos_trades),
                }

                windows.append({
                    "window_number": window_num,
                    "is_start": str(ohlcv.index[is_start])[:10] if is_start < len(ohlcv.index) else "",
                    "is_end": str(ohlcv.index[min(is_end - 1, len(ohlcv.index) - 1)])[:10],
                    "oos_start": str(ohlcv.index[oos_start])[:10] if oos_start < len(ohlcv.index) else "",
                    "oos_end": str(ohlcv.index[min(oos_end - 1, len(ohlcv.index) - 1)])[:10],
                    "is_metrics": is_metrics,
                    "oos_metrics": oos_metrics,
                    "params_used": {"fast_period": fast_p, "slow_period": slow_p},
                    "oos_result_id": oos_result_id,
                })

                # Add OOS equity to combined curve
                for dt, val in oos_equity.items():
                    combined_oos_equity.append({
                        "date": str(dt)[:10],
                        "strategy_value": float(val),
                        "benchmark_value": float(val),
                        "drawdown_pct": 0,
                    })

                progress = int(5 + 90 * window_num / max(1, (total_bars - is_days) // step_days))
                update_job(job_id, progress=min(95, progress))

                pos += step_days

            if not windows:
                set_job_failed(job_id, "Not enough data for even one walk-forward window. Try shorter in-sample/out-of-sample periods or a longer date range.")
                return

            # Compute combined OOS metrics
            combined_oos_values = [p["strategy_value"] for p in combined_oos_equity]
            combined_equity = pd.Series(combined_oos_values)
            combined_metrics = compute_metrics(combined_equity) if len(combined_equity) > 1 else {}

            # Compute stability score
            oos_sharpes = [w["oos_metrics"].get("sharpe_ratio", 0) for w in windows]
            is_sharpes = [w["is_metrics"].get("sharpe_ratio", 0) for w in windows]

            # Stability components
            # 1. OOS Sharpe consistency (low std relative to mean)
            oos_mean = sum(oos_sharpes) / len(oos_sharpes) if oos_sharpes else 0
            oos_std = (sum((s - oos_mean) ** 2 for s in oos_sharpes) / len(oos_sharpes)) ** 0.5 if len(oos_sharpes) > 1 else 0
            consistency = max(0, min(100, 100 * (1 - oos_std / max(abs(oos_mean), 0.01))))

            # 2. IS-OOS correlation (higher is better)
            is_oos_corr = 0.0
            if len(is_sharpes) > 2:
                try:
                    is_s = pd.Series(is_sharpes)
                    oos_s = pd.Series(oos_sharpes)
                    is_oos_corr = float(is_s.corr(oos_s))
                    if pd.isna(is_oos_corr):
                        is_oos_corr = 0.0
                except Exception:
                    pass
            correlation_score = max(0, min(100, is_oos_corr * 100))

            # 3. Positive OOS windows
            positive_oos = sum(1 for s in oos_sharpes if s > 0)
            positive_pct = positive_oos / len(oos_sharpes) * 100 if oos_sharpes else 0

            stability_score = (consistency * 0.4 + correlation_score * 0.3 + positive_pct * 0.3)

            def _status(val: float) -> str:
                if val >= 70:
                    return "pass"
                if val >= 40:
                    return "warn"
                return "fail"

            stability_components = [
                {"name": "OOS Consistency", "value": round(consistency, 1), "weight": 0.4, "status": _status(consistency)},
                {"name": "IS-OOS Correlation", "value": round(correlation_score, 1), "weight": 0.3, "status": _status(correlation_score)},
                {"name": "Positive OOS Windows", "value": round(positive_pct, 1), "weight": 0.3, "status": _status(positive_pct)},
            ]

            set_job_result(job_id, {
                "id": job_id,
                "window_type": window_type,
                "windows": windows,
                "combined_oos_equity": combined_oos_equity,
                "combined_oos_metrics": combined_metrics,
                "stability_score": round(stability_score, 1),
                "stability_components": stability_components,
            })
        except Exception as e:
            set_job_failed(job_id, str(e))

    asyncio.create_task(_run())
    return {"job_id": job_id}


# ─── Monte Carlo ───

class MonteCarloRequest(BaseModel):
    """Monte Carlo simulation request."""
    backtest_result_id: str
    method: str = "trade_resample"
    simulations: int = 1000
    confidence_level: float = 0.95
    block_size: int | None = None


@router.post("/monte-carlo")
async def run_monte_carlo(body: MonteCarloRequest):
    """Monte Carlo simulation on an existing backtest result."""
    job_id = create_job("backtest_monte_carlo")

    async def _run():
        try:
            update_job(job_id, status=JobStatus.RUNNING, progress=5)

            stored = _backtest_results.get(body.backtest_result_id)
            if not stored:
                set_job_failed(job_id, f"Backtest result {body.backtest_result_id} not found. Run a backtest first.")
                return

            trades = stored.get("trades", [])
            equity_dict = stored.get("equity_curve", {})

            if not trades and not equity_dict:
                set_job_failed(job_id, "No trades or equity data in the referenced backtest result")
                return

            n_sims = min(body.simulations, 10000)
            method = body.method

            # Get daily returns from equity curve
            eq_values = list(equity_dict.values()) if equity_dict else []
            daily_returns = []
            if len(eq_values) > 1:
                for i in range(1, len(eq_values)):
                    if eq_values[i - 1] != 0:
                        daily_returns.append(eq_values[i] / eq_values[i - 1] - 1)

            trade_pnls = [t.get("pnl_pct", 0) for t in trades]
            n_periods = max(len(daily_returns), len(trade_pnls), 50)

            terminal_returns: list[float] = []
            max_drawdowns: list[float] = []
            sharpe_ratios: list[float] = []
            percentile_paths: dict[int, list[float]] = {}

            # Store some paths for percentile curves
            all_paths: list[list[float]] = []

            for sim in range(n_sims):
                if method == "trade_resample" and trade_pnls:
                    # Resample trades randomly
                    sampled = [random.choice(trade_pnls) for _ in range(len(trade_pnls))]
                    equity_path = [1.0]
                    for r in sampled:
                        equity_path.append(equity_path[-1] * (1 + r))
                elif method == "block_bootstrap" and daily_returns:
                    block_size = body.block_size or 20
                    sampled_returns = []
                    while len(sampled_returns) < len(daily_returns):
                        start_idx = random.randint(0, max(0, len(daily_returns) - block_size))
                        block = daily_returns[start_idx:start_idx + block_size]
                        sampled_returns.extend(block)
                    sampled_returns = sampled_returns[:len(daily_returns)]
                    equity_path = [1.0]
                    for r in sampled_returns:
                        equity_path.append(equity_path[-1] * (1 + r))
                elif daily_returns:
                    # return_shuffle
                    sampled = daily_returns.copy()
                    random.shuffle(sampled)
                    equity_path = [1.0]
                    for r in sampled:
                        equity_path.append(equity_path[-1] * (1 + r))
                else:
                    equity_path = [1.0, 1.0]

                terminal_ret = equity_path[-1] / equity_path[0] - 1
                terminal_returns.append(terminal_ret)

                # Max drawdown of this path
                peak = equity_path[0]
                mdd = 0.0
                for val in equity_path:
                    peak = max(peak, val)
                    dd = (val - peak) / peak if peak > 0 else 0
                    mdd = min(mdd, dd)
                max_drawdowns.append(mdd)

                # Sharpe of this path
                if len(equity_path) > 2:
                    path_returns = [(equity_path[i] / equity_path[i-1] - 1) for i in range(1, len(equity_path))]
                    mean_r = sum(path_returns) / len(path_returns)
                    std_r = (sum((r - mean_r) ** 2 for r in path_returns) / len(path_returns)) ** 0.5
                    sim_sharpe = (mean_r / std_r * (252 ** 0.5)) if std_r > 0 else 0
                else:
                    sim_sharpe = 0.0
                sharpe_ratios.append(sim_sharpe)

                all_paths.append(equity_path)

                if sim % max(1, n_sims // 20) == 0:
                    update_job(job_id, progress=int(5 + 85 * sim / n_sims))

            # Compute percentile curves
            max_len = max(len(p) for p in all_paths) if all_paths else 0
            percentile_curves = []
            for pct in [5, 25, 50, 75, 95]:
                curve_values = []
                for t in range(max_len):
                    vals_at_t = [p[min(t, len(p) - 1)] for p in all_paths]
                    vals_at_t.sort()
                    idx = int(len(vals_at_t) * pct / 100)
                    idx = max(0, min(idx, len(vals_at_t) - 1))
                    curve_values.append(vals_at_t[idx])
                percentile_curves.append({"percentile": pct, "values": curve_values})

            # Actual metrics from original backtest
            actual_metrics = stored.get("metrics", {})
            actual_sharpe = actual_metrics.get("sharpe_ratio", 0)
            actual_return = actual_metrics.get("total_return", 0)
            actual_mdd = actual_metrics.get("max_drawdown", 0)

            terminal_returns.sort()
            max_drawdowns.sort()
            sharpe_ratios.sort()

            def percentile(arr: list, p: float) -> float:
                if not arr:
                    return 0.0
                idx = int(len(arr) * p / 100)
                return arr[max(0, min(idx, len(arr) - 1))]

            def actual_pct(arr: list, actual: float) -> float:
                if not arr:
                    return 50.0
                below = sum(1 for x in arr if x < actual)
                return below / len(arr) * 100

            summary = [
                {
                    "metric": "Total Return",
                    "actual": actual_return,
                    "median": percentile(terminal_returns, 50),
                    "pct_5": percentile(terminal_returns, 5),
                    "pct_95": percentile(terminal_returns, 95),
                    "actual_percentile": actual_pct(terminal_returns, actual_return),
                },
                {
                    "metric": "Max Drawdown",
                    "actual": actual_mdd,
                    "median": percentile(max_drawdowns, 50),
                    "pct_5": percentile(max_drawdowns, 5),
                    "pct_95": percentile(max_drawdowns, 95),
                    "actual_percentile": actual_pct(max_drawdowns, actual_mdd),
                },
                {
                    "metric": "Sharpe Ratio",
                    "actual": actual_sharpe,
                    "median": percentile(sharpe_ratios, 50),
                    "pct_5": percentile(sharpe_ratios, 5),
                    "pct_95": percentile(sharpe_ratios, 95),
                    "actual_percentile": actual_pct(sharpe_ratios, actual_sharpe),
                },
            ]

            pct_positive_sharpe = sum(1 for s in sharpe_ratios if s > 0) / len(sharpe_ratios) * 100 if sharpe_ratios else 0
            pct_beats_benchmark = sum(1 for r in terminal_returns if r > 0) / len(terminal_returns) * 100 if terminal_returns else 0
            probability_of_loss = sum(1 for r in terminal_returns if r < 0) / len(terminal_returns) * 100 if terminal_returns else 0

            set_job_result(job_id, {
                "method": method,
                "simulations": n_sims,
                "confidence_level": body.confidence_level,
                "percentile_curves": percentile_curves,
                "terminal_returns": terminal_returns[:200],  # Limit for payload size
                "max_drawdowns": max_drawdowns[:200],
                "sharpe_ratios": sharpe_ratios[:200],
                "summary": summary,
                "pct_positive_sharpe": pct_positive_sharpe,
                "pct_beats_benchmark": pct_beats_benchmark,
                "probability_of_loss": probability_of_loss,
            })
        except Exception as e:
            set_job_failed(job_id, str(e))

    asyncio.create_task(_run())
    return {"job_id": job_id}


# ─── Library ───

@router.post("/library")
async def save_to_library(body: dict):
    """Save result to library."""
    entry_id = str(uuid.uuid4())
    result_id = body.get("result_id", "")
    stored = _backtest_results.get(result_id, {})
    metrics = stored.get("metrics", {})
    config = stored.get("config", {})

    entry = {
        "id": entry_id,
        "result_id": result_id,
        "name": body.get("name", "Untitled"),
        "notes": body.get("notes"),
        "tags": body.get("tags", []),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "config": config or {
            "strategy_type": "sma_crossover",
            "strategy_config": {},
            "assets": ["SPY"],
            "date_range": {"start": "", "end": ""},
            "interval": "1d",
            "benchmark": "",
            "fees": {"maker_bps": 0, "taker_bps": 0},
        },
        "summary_metrics": {
            "total_return": metrics.get("total_return", 0),
            "annualized_return": metrics.get("annualized_return", 0),
            "sharpe": metrics.get("sharpe_ratio", 0),
            "sortino": metrics.get("sortino_ratio", 0),
            "calmar": metrics.get("calmar_ratio", 0),
            "max_drawdown": metrics.get("max_drawdown", 0),
            "win_rate": metrics.get("win_rate", 0),
            "profit_factor": metrics.get("profit_factor", 0),
            "total_trades": metrics.get("total_trades", 0),
        },
        "analysis": {
            "has_regime_analysis": False,
            "has_monte_carlo": False,
            "has_walk_forward": False,
        },
    }
    _library[entry_id] = entry
    return entry


@router.get("/library")
async def get_library(
    q: str | None = None,
    type: str | None = None,
    sort: str | None = None,
    sharpe_min: float | None = None,
    tag: str | None = None,
    page: int = 1,
    per_page: int = 20,
):
    """Get library entries with filtering and pagination."""
    entries = list(_library.values())

    # Filter by search query
    if q:
        q_lower = q.lower()
        entries = [e for e in entries if q_lower in e.get("name", "").lower() or q_lower in (e.get("notes") or "").lower()]

    # Filter by strategy type
    if type:
        entries = [e for e in entries if e.get("config", {}).get("strategy_type") == type]

    # Filter by minimum Sharpe
    if sharpe_min is not None:
        entries = [e for e in entries if e.get("summary_metrics", {}).get("sharpe", 0) >= sharpe_min]

    # Filter by tag
    if tag:
        entries = [e for e in entries if tag in e.get("tags", [])]

    # Sort
    if sort == "sharpe":
        entries.sort(key=lambda e: e.get("summary_metrics", {}).get("sharpe", 0), reverse=True)
    elif sort == "return":
        entries.sort(key=lambda e: e.get("summary_metrics", {}).get("total_return", 0), reverse=True)
    elif sort == "max_dd":
        entries.sort(key=lambda e: e.get("summary_metrics", {}).get("max_drawdown", 0))  # Less negative first
    elif sort == "name":
        entries.sort(key=lambda e: e.get("name", "").lower())
    else:  # recent
        entries.sort(key=lambda e: e.get("created_at", ""), reverse=True)

    total = len(entries)
    start = (page - 1) * per_page
    end = start + per_page
    return {"entries": entries[start:end], "total": total}


@router.put("/library/{entry_id}")
async def update_library_entry(entry_id: str, body: dict):
    """Update library entry."""
    if entry_id not in _library:
        raise HTTPException(status_code=404, detail="Library entry not found")
    entry = _library[entry_id]
    if "name" in body:
        entry["name"] = body["name"]
    if "notes" in body:
        entry["notes"] = body["notes"]
    if "tags" in body:
        entry["tags"] = body["tags"]
    _library[entry_id] = entry
    return entry


@router.delete("/library/{entry_id}")
async def delete_library_entry(entry_id: str):
    """Delete library entry."""
    if entry_id not in _library:
        raise HTTPException(status_code=404, detail="Library entry not found")
    del _library[entry_id]
    return {"status": "deleted"}


@router.get("/{run_id}")
async def get_backtest_result(run_id: str):
    """Get backtest result by job id or stored result id."""
    job = get_job(run_id)
    if job:
        if job["status"] != JobStatus.COMPLETED:
            return {"job_id": run_id, "status": job["status"], "result": job.get("result"), "error": job.get("error")}
        return {"job_id": run_id, "status": job["status"], "result": job["result"]}

    # Also check stored results (optimizer cells, walk-forward windows, etc.)
    stored = _backtest_results.get(run_id)
    if stored:
        return {"job_id": run_id, "status": "completed", "result": stored}

    raise HTTPException(status_code=404, detail="Backtest run not found")
