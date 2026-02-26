"""Backtest API endpoints."""

from datetime import date, timedelta

from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.core.jobs import create_job, get_job, set_job_result, set_job_failed, JobStatus
from app.providers.factory import get_provider
from app.providers.base import AssetClass
from app.backtest.vectorbt_engine import run_backtest, VBT_AVAILABLE

router = APIRouter()


@router.get("/benchmarks/list")  # Must be before /{run_id}
async def list_benchmarks():
    """List available benchmarks."""
    return {
        "benchmarks": [
            {"id": "SPY", "name": "S&P 500", "symbol": "SPY"},
            {"id": "QQQ", "name": "NASDAQ 100", "symbol": "QQQ"},
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
    # Simplified: use SMA crossover. strategy_id could extend later
    fast_period: int = 10
    slow_period: int = 30


@router.post("/run")  # Must be before /{run_id}
async def run_backtest_request(req: BacktestRequest):
    """Run backtest - returns job_id. Poll GET /jobs/{id} for result."""
    job_id = create_job("backtest")

    async def _run():
        try:
            provider = get_provider(None)
            df = await provider.get_historical(req.symbol, req.start, req.end, req.interval)
            if df.empty or "close" not in df.columns:
                # Normalize column names
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
            set_job_result(
                job_id,
                {
                    "symbol": req.symbol,
                    "metrics": result.metrics,
                    "equity_curve": result.equity_curve.dropna().astype(float).to_dict() if not result.equity_curve.empty else {},
                    "trades_count": len(result.trades),
                },
            )
        except Exception as e:
            set_job_failed(job_id, str(e))

    import asyncio
    asyncio.create_task(_run())
    return {"job_id": job_id}


@router.get("/{run_id}")
async def get_backtest_result(run_id: str):
    """Get backtest result by job id."""
    job = get_job(run_id)
    if not job:
        return {"error": "Not found"}
    if job["status"] != JobStatus.COMPLETED:
        return {"job_id": run_id, "status": job["status"], "result": job.get("result"), "error": job.get("error")}
    return {"job_id": run_id, "status": job["status"], "result": job["result"]}
