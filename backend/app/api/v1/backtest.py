"""Backtest API endpoints."""

from datetime import date, timedelta

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.core.jobs import create_job, get_job, update_job, set_job_result, set_job_failed, JobStatus
from app.providers.factory import get_provider
from app.providers.base import AssetClass
from app.backtest.vectorbt_engine import run_backtest, trades_to_records, VBT_AVAILABLE

router = APIRouter()


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
    benchmark: str | None = None  # e.g. SPY, QQQ - compare strategy to buy-and-hold
    # Simplified: use SMA crossover. strategy_id could extend later
    fast_period: int = 10
    slow_period: int = 30


@router.post("/run")  # Must be before /{run_id}
async def run_backtest_request(req: BacktestRequest):
    """Run backtest - returns job_id. Poll GET /jobs/{id} for result."""
    job_id = create_job("backtest")

    async def _run():
        try:
            update_job(job_id, status=JobStatus.RUNNING)
            provider = get_provider(None)
            df = await provider.get_historical(req.symbol, req.start, req.end, req.interval)
            if not df.empty and "close" not in df.columns:
                # Normalize column names (YFinance returns capitalized names)
                cols = {"Close": "close", "Open": "open", "High": "high", "Low": "low", "Volume": "volume"}
                df = df.rename(columns=cols)
            if df.empty:
                set_job_failed(job_id, "No data returned")
                return

            close = df.set_index("bucket")["close"] if "bucket" in df.columns else df["close"]
            try:
                fast = close.rolling(req.fast_period).mean()
                slow = close.rolling(req.slow_period).mean()
                entries = (fast > slow) & (fast.shift(1) <= slow.shift(1))
                exits = (fast < slow) & (fast.shift(1) >= slow.shift(1))
            except Exception:
                entries = close > close.shift(1)  # Dummy
                exits = close < close.shift(1)

            ohlcv = df.set_index("bucket")[["open", "high", "low", "close", "volume"]] if "bucket" in df.columns else df[["open", "high", "low", "close", "volume"]]
            ohlcv = ohlcv.rename(columns=str.lower)

            result = run_backtest(
                ohlcv,
                entries.reindex(ohlcv.index).fillna(False),
                exits.reindex(ohlcv.index).fillna(False),
                req.maker_fee_bps,
                req.taker_fee_bps,
            )
            trades_list = trades_to_records(result.trades, req.symbol)

            # Build equity curve with optional benchmark
            strategy_equity = result.equity_curve.dropna()
            strategy_curve = {str(k)[:10]: float(v) for k, v in strategy_equity.astype(float).items()} if not strategy_equity.empty else {}
            benchmark_curve: dict[str, float] = {}
            if req.benchmark and req.benchmark.strip():
                try:
                    bench_df = await provider.get_historical(req.benchmark.strip(), req.start, req.end, req.interval)
                    if not bench_df.empty:
                        if "close" not in bench_df.columns and "Close" in bench_df.columns:
                            bench_df = bench_df.rename(columns={"Close": "close", "Open": "open", "High": "high", "Low": "low", "Volume": "volume"})
                        bench_close = bench_df.set_index("bucket")["close"] if "bucket" in bench_df.columns else bench_df["close"]
                        bench_close = bench_close.dropna()
                        if not bench_close.empty and len(strategy_equity) > 0:
                            initial_strategy = float(strategy_equity.iloc[0])
                            bench_return = bench_close / bench_close.iloc[0]
                            bench_aligned = bench_return.reindex(strategy_equity.index).ffill().bfill()
                            bc = bench_aligned.dropna().mul(initial_strategy).astype(float)
                            benchmark_curve = {str(k)[:10]: float(v) for k, v in bc.items()}
                except Exception:
                    pass

            set_job_result(
                job_id,
                {
                    "symbol": req.symbol,
                    "benchmark": req.benchmark or "",
                    "metrics": result.metrics,
                    "equity_curve": strategy_curve,
                    "benchmark_curve": benchmark_curve,
                    "trades_count": len(trades_list),
                    "trades": trades_list,
                },
            )
        except Exception as e:
            set_job_failed(job_id, str(e))

    import asyncio
    asyncio.create_task(_run())
    return {"job_id": job_id}


@router.get("/pinned")  # /backtest/pinned - avoids conflict with /{run_id}
async def get_pinned_results():
    """Get pinned backtest results. Stub - returns empty list."""
    return []


@router.get("/results/pinned")  # alias for clients using /backtest/results/pinned
async def get_pinned_results_alias():
    """Get pinned backtest results (alias). Stub - returns empty list."""
    return []


@router.post("/optimize")
async def run_optimizer(body: dict):
    """Parameter optimization. Stub - returns job_id."""
    from app.core.jobs import create_job
    job_id = create_job("backtest_optimize")
    return {"job_id": job_id}


@router.post("/walk-forward")
async def run_walk_forward(body: dict | None = None):
    """Walk-forward analysis. Stub - returns job_id."""
    from app.core.jobs import create_job
    job_id = create_job("backtest_walk_forward")
    return {"job_id": job_id}


@router.post("/monte-carlo")
async def run_monte_carlo(body: dict):
    """Monte Carlo simulation. Stub - returns job_id."""
    from app.core.jobs import create_job
    job_id = create_job("backtest_monte_carlo")
    return {"job_id": job_id}


@router.post("/library")
async def save_to_library(body: dict):
    """Save result to library. Stub."""
    return {"id": "stub", "result_id": body.get("result_id", ""), "name": body.get("name", ""), "notes": body.get("notes"), "tags": body.get("tags", []), "created_at": "2024-01-01T00:00:00Z", "config": {}, "summary_metrics": {}, "analysis": {}, "result_id": body.get("result_id", "")}


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
    """Get library entries. Stub - returns empty."""
    return {"entries": [], "total": 0}


@router.put("/library/{entry_id}")
async def update_library_entry(entry_id: str, body: dict):
    """Update library entry. Stub."""
    return body


@router.delete("/library/{entry_id}")
async def delete_library_entry(entry_id: str):
    """Delete library entry. Stub."""
    return None


@router.post("/results/{result_id}/pin")
async def pin_result(result_id: str):
    """Pin a result. Stub."""
    return None


@router.delete("/results/{result_id}/pin")
async def unpin_result(result_id: str):
    """Unpin a result. Stub."""
    return None


@router.get("/{run_id}")
async def get_backtest_result(run_id: str):
    """Get backtest result by job id."""
    job = get_job(run_id)
    if not job:
        raise HTTPException(status_code=404, detail="Backtest run not found")
    if job["status"] != JobStatus.COMPLETED:
        return {"job_id": run_id, "status": job["status"], "result": job.get("result"), "error": job.get("error")}
    return {"job_id": run_id, "status": job["status"], "result": job["result"]}
