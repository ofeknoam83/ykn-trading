"""VectorBT backtesting engine."""

from dataclasses import dataclass
from typing import Any

import pandas as pd

try:
    import vectorbt as vbt
    VBT_AVAILABLE = True
except ImportError:
    VBT_AVAILABLE = False


def trades_to_records(trades_df: pd.DataFrame, symbol: str) -> list[dict[str, Any]]:
    """Convert vectorbt records_readable DataFrame to frontend TradeRecord format."""
    if trades_df.empty:
        return []

    records: list[dict[str, Any]] = []
    cols = trades_df.columns.tolist()

    def _get(row: pd.Series, *keys: str) -> Any:
        for k in keys:
            if k in cols:
                return row[k]
        return None

    for i, row in trades_df.iterrows():
        status = _get(row, "Status")
        if status is not None and str(status) != "Closed":
            continue

        direction = _get(row, "Direction") or "Long"
        side = str(direction).lower() if direction else "long"
        entry_ts = _get(row, "Entry Timestamp")
        exit_ts = _get(row, "Exit Timestamp")
        size = _get(row, "Size") or 0
        entry_price = _get(row, "Avg Entry Price") or 0
        exit_price = _get(row, "Avg Exit Price") or 0
        pnl = _get(row, "PnL") or 0
        ret = _get(row, "Return") or 0
        entry_fees = _get(row, "Entry Fees") or 0
        exit_fees = _get(row, "Exit Fees") or 0
        trade_id = _get(row, "Exit Trade Id", "Trade Id", "Position Id") or i

        def to_date(val: Any) -> str:
            if val is None or (isinstance(val, float) and (val != val or val == 0)):
                return ""
            if hasattr(val, "strftime"):
                return val.strftime("%Y-%m-%d")
            return str(val)[:10]

        entry_date = to_date(entry_ts)
        exit_date = to_date(exit_ts)

        duration_days = 0
        if entry_ts is not None and exit_ts is not None:
            try:
                if hasattr(exit_ts, "__sub__") and hasattr(entry_ts, "__sub__"):
                    delta = exit_ts - entry_ts
                    duration_days = max(0, int(getattr(delta, "days", delta)))
            except Exception:
                pass

        records.append({
            "id": str(trade_id),
            "symbol": symbol,
            "side": "short" if "short" in side else "long",
            "entry_date": entry_date,
            "exit_date": exit_date,
            "entry_price": float(entry_price),
            "exit_price": float(exit_price),
            "quantity": abs(float(size)),
            "pnl": float(pnl),
            "pnl_pct": float(ret),
            "duration_days": duration_days,
            "fees": float(entry_fees or 0) + float(exit_fees or 0),
        })
    return records


@dataclass
class BacktestResult:
    """Backtest result."""

    equity_curve: pd.Series
    trades: pd.DataFrame
    metrics: dict


def run_backtest(
    ohlcv: pd.DataFrame,
    entries: pd.Series,
    exits: pd.Series,
    maker_fee_bps: float = 0,
    taker_fee_bps: float = 0,
) -> BacktestResult:
    """Run vectorized backtest. entries/exits are boolean Series aligned to ohlcv index."""
    if not VBT_AVAILABLE:
        return BacktestResult(
            equity_curve=pd.Series(dtype=float),
            trades=pd.DataFrame(),
            metrics={"error": "vectorbt not installed"},
        )

    fees = (maker_fee_bps + taker_fee_bps) / 10000
    portfolio = vbt.Portfolio.from_signals(
        ohlcv["close"],
        entries=entries,
        exits=exits,
        freq="1D",
        fees=fees,
    )
    equity = portfolio.value()
    trades = portfolio.trades.records_readable if hasattr(portfolio.trades, "records_readable") else pd.DataFrame()
    metrics = {
        "total_return": float(portfolio.total_return()),
        "sharpe_ratio": float(portfolio.sharpe_ratio()) if hasattr(portfolio, "sharpe_ratio") else 0,
        "max_drawdown": float(portfolio.max_drawdown()) if hasattr(portfolio, "max_drawdown") else 0,
        "num_trades": int(portfolio.trades.count()) if hasattr(portfolio.trades, "count") else 0,
    }
    return BacktestResult(equity_curve=equity, trades=trades, metrics=metrics)
