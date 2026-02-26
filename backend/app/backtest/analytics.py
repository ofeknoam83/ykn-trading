"""Backtest analytics - Sharpe, Sortino, Calmar, etc."""

import pandas as pd


def sharpe_ratio(returns: pd.Series, risk_free: float = 0.0, annualization: int = 252) -> float:
    """Compute Sharpe ratio."""
    if returns.empty or returns.std() == 0:
        return 0.0
    excess = returns - risk_free
    return float(excess.mean() / excess.std() * (annualization**0.5))


def sortino_ratio(returns: pd.Series, risk_free: float = 0.0, annualization: int = 252) -> float:
    """Compute Sortino ratio (downside deviation)."""
    if returns.empty:
        return 0.0
    downside = returns[returns < 0]
    if downside.empty or downside.std() == 0:
        return 0.0
    excess = returns.mean() - risk_free
    return float(excess / downside.std() * (annualization**0.5))


def max_drawdown(equity: pd.Series) -> float:
    """Compute maximum drawdown."""
    if equity.empty:
        return 0.0
    cummax = equity.cummax()
    dd = (equity - cummax) / cummax
    return float(dd.min())


def calmar_ratio(returns: pd.Series, equity: pd.Series, annualization: int = 252) -> float:
    """Calmar ratio = annual return / max drawdown."""
    if returns.empty or equity.empty:
        return 0.0
    ann_ret = returns.mean() * annualization
    md = abs(max_drawdown(equity))
    return float(ann_ret / md) if md > 0 else 0.0


def profit_factor(trades: pd.DataFrame) -> float:
    """Profit factor = gross profit / gross loss."""
    if trades.empty or "pnl" not in trades.columns:
        return 1.0
    wins = trades[trades["pnl"] > 0]["pnl"].sum()
    losses = abs(trades[trades["pnl"] < 0]["pnl"].sum())
    return float(wins / losses) if losses > 0 else (float("inf") if wins > 0 else 1.0)


def compute_metrics(equity: pd.Series, trades: pd.DataFrame) -> dict:
    """Compute all metrics."""
    returns = equity.pct_change().dropna()
    return {
        "sharpe_ratio": sharpe_ratio(returns),
        "sortino_ratio": sortino_ratio(returns),
        "max_drawdown": max_drawdown(equity),
        "calmar_ratio": calmar_ratio(returns, equity),
        "profit_factor": profit_factor(trades) if not trades.empty else 1.0,
        "total_return": float((equity.iloc[-1] / equity.iloc[0] - 1) if len(equity) > 1 else 0),
    }
