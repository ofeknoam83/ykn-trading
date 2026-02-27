"""Backtest analytics - Sharpe, Sortino, Calmar, drawdowns, monthly returns, etc."""

from typing import Any

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


def profit_factor(trades_df: pd.DataFrame) -> float:
    """Profit factor = gross profit / gross loss."""
    if trades_df.empty or "pnl" not in trades_df.columns:
        return 1.0
    wins = trades_df[trades_df["pnl"] > 0]["pnl"].sum()
    losses = abs(trades_df[trades_df["pnl"] < 0]["pnl"].sum())
    return float(wins / losses) if losses > 0 else (float("inf") if wins > 0 else 1.0)


def compute_drawdown_series(equity: pd.Series) -> list[dict[str, Any]]:
    """Compute drawdown series with underwater days count."""
    if equity.empty:
        return []
    cummax = equity.cummax()
    dd_pct = (equity - cummax) / cummax

    series: list[dict[str, Any]] = []
    underwater_days = 0
    for date, dd_val in dd_pct.items():
        if dd_val < 0:
            underwater_days += 1
        else:
            underwater_days = 0
        series.append({
            "date": str(date)[:10],
            "drawdown_pct": float(dd_val),
            "underwater_days": underwater_days,
        })
    return series


def compute_top_drawdowns(equity: pd.Series, top_n: int = 5) -> list[dict[str, Any]]:
    """Find top N drawdown periods with start, bottom, recovery dates."""
    if equity.empty or len(equity) < 2:
        return []

    cummax = equity.cummax()
    dd_pct = (equity - cummax) / cummax

    periods: list[dict[str, Any]] = []
    in_dd = False
    start_date = None
    bottom_date = None
    bottom_val = 0.0

    for date, val in dd_pct.items():
        if val < 0:
            if not in_dd:
                in_dd = True
                start_date = date
                bottom_date = date
                bottom_val = val
            elif val < bottom_val:
                bottom_date = date
                bottom_val = val
        else:
            if in_dd:
                periods.append({
                    "start_date": str(start_date)[:10],
                    "bottom_date": str(bottom_date)[:10],
                    "recovery_date": str(date)[:10],
                    "depth_pct": float(bottom_val),
                    "duration_days": 0,
                    "recovery_days": 0,
                })
                in_dd = False

    # Handle ongoing drawdown
    if in_dd and start_date is not None:
        periods.append({
            "start_date": str(start_date)[:10],
            "bottom_date": str(bottom_date)[:10],
            "recovery_date": None,
            "depth_pct": float(bottom_val),
            "duration_days": 0,
            "recovery_days": None,
        })

    # Compute proper durations and recovery days
    for p in periods:
        try:
            s = pd.Timestamp(p["start_date"])
            b = pd.Timestamp(p["bottom_date"])
            p["duration_days"] = max(1, (b - s).days)
            if p["recovery_date"]:
                r = pd.Timestamp(p["recovery_date"])
                p["recovery_days"] = max(0, (r - b).days)
        except Exception:
            pass

    # Sort by depth (most negative first) and return top N
    periods.sort(key=lambda x: x["depth_pct"])
    return periods[:top_n]


def compute_monthly_returns(equity: pd.Series) -> list[dict[str, Any]]:
    """Compute monthly return percentages from equity series."""
    if equity.empty or len(equity) < 2:
        return []

    # Ensure index is datetime
    if not isinstance(equity.index, pd.DatetimeIndex):
        try:
            equity = equity.copy()
            equity.index = pd.to_datetime(equity.index)
        except Exception:
            return []

    monthly: list[dict[str, Any]] = []
    grouped = equity.resample("ME").last().dropna()
    prev = None
    for date, val in grouped.items():
        if prev is not None and prev != 0:
            ret = (val - prev) / prev
            monthly.append({
                "year": date.year,
                "month": date.month,
                "return_pct": float(ret),
            })
        prev = val
    return monthly


def compute_metrics(equity: pd.Series, trades_records: list[dict] | None = None) -> dict[str, Any]:
    """Compute all metrics matching the frontend BacktestMetrics interface.

    Args:
        equity: Portfolio equity curve as a pandas Series.
        trades_records: List of trade record dicts (from trades_to_records), each with
            pnl, pnl_pct, duration_days, etc.
    """
    returns = equity.pct_change().dropna()
    n_days = len(returns)
    ann_factor = 252

    # Basic return metrics
    total_ret = float((equity.iloc[-1] / equity.iloc[0] - 1) if len(equity) > 1 else 0)
    ann_ret = float(returns.mean() * ann_factor) if n_days > 0 else 0.0
    vol_ann = float(returns.std() * (ann_factor ** 0.5)) if n_days > 1 else 0.0

    # Drawdown metrics
    mdd = max_drawdown(equity)
    cummax = equity.cummax()
    dd = (equity - cummax) / cummax
    max_dd_duration = 0
    cur_duration = 0
    for val in dd:
        if val < 0:
            cur_duration += 1
            max_dd_duration = max(max_dd_duration, cur_duration)
        else:
            cur_duration = 0

    # Trade-level metrics
    n_trades = 0
    win_rate = 0.0
    avg_win = 0.0
    avg_loss = 0.0
    best_trade = 0.0
    worst_trade = 0.0
    avg_trade_duration = 0.0
    pf = 1.0

    trades = trades_records or []
    if trades:
        n_trades = len(trades)
        winners = [t for t in trades if t.get("pnl", 0) > 0]
        losers = [t for t in trades if t.get("pnl", 0) < 0]
        win_rate = float(len(winners) / n_trades) if n_trades > 0 else 0.0

        pnl_pcts = [t.get("pnl_pct", 0) for t in trades]
        win_pcts = [t.get("pnl_pct", 0) for t in winners]
        loss_pcts = [t.get("pnl_pct", 0) for t in losers]

        avg_win = float(sum(win_pcts) / len(win_pcts)) if win_pcts else 0.0
        avg_loss = float(sum(loss_pcts) / len(loss_pcts)) if loss_pcts else 0.0
        best_trade = float(max(pnl_pcts)) if pnl_pcts else 0.0
        worst_trade = float(min(pnl_pcts)) if pnl_pcts else 0.0

        durations = [t.get("duration_days", 0) for t in trades]
        avg_trade_duration = float(sum(durations) / len(durations)) if durations else 0.0

        gross_profit = sum(t["pnl"] for t in winners)
        gross_loss = abs(sum(t["pnl"] for t in losers))
        pf = float(gross_profit / gross_loss) if gross_loss > 0 else (float("inf") if gross_profit > 0 else 1.0)

    # Distribution metrics
    skew = float(returns.skew()) if n_days > 2 else 0.0
    kurt = float(returns.kurtosis()) if n_days > 3 else 0.0

    return {
        "total_return": total_ret,
        "annualized_return": ann_ret,
        "sharpe_ratio": sharpe_ratio(returns),
        "sortino_ratio": sortino_ratio(returns),
        "calmar_ratio": calmar_ratio(returns, equity),
        "max_drawdown": mdd,
        "max_drawdown_duration_days": max_dd_duration,
        "profit_factor": pf,
        "win_rate": win_rate,
        "avg_win": avg_win,
        "avg_loss": avg_loss,
        "total_trades": n_trades,
        "best_trade": best_trade,
        "worst_trade": worst_trade,
        "avg_trade_duration_days": avg_trade_duration,
        "volatility_annualized": vol_ann,
        "beta": 0.0,
        "alpha": 0.0,
        "information_ratio": 0.0,
        "skewness": skew,
        "kurtosis": kurt,
    }


def compute_metrics_with_benchmark(
    equity: pd.Series,
    trades_records: list[dict] | None = None,
    benchmark_returns: pd.Series | None = None,
) -> dict[str, Any]:
    """Compute all metrics including benchmark-relative ones (beta, alpha, IR)."""
    metrics = compute_metrics(equity, trades_records)

    if benchmark_returns is not None and not benchmark_returns.empty:
        strat_returns = equity.pct_change().dropna()
        common = strat_returns.index.intersection(benchmark_returns.index)
        if len(common) > 10:
            sr = strat_returns.reindex(common).dropna()
            br = benchmark_returns.reindex(common).dropna()
            if len(sr) > 10 and len(br) > 10 and br.std() > 0:
                cov = sr.cov(br)
                var_b = br.var()
                beta = float(cov / var_b) if var_b > 0 else 0.0
                alpha = float((sr.mean() - beta * br.mean()) * 252)
                tracking_error = (sr - br).std() * (252 ** 0.5)
                info_ratio = float((sr.mean() - br.mean()) * 252 / tracking_error) if tracking_error > 0 else 0.0
                metrics["beta"] = beta
                metrics["alpha"] = alpha
                metrics["information_ratio"] = info_ratio

    return metrics
