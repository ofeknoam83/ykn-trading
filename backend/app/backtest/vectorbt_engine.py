"""VectorBT backtesting engine."""

from dataclasses import dataclass

import pandas as pd

try:
    import vectorbt as vbt
    VBT_AVAILABLE = True
except ImportError:
    VBT_AVAILABLE = False


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
