import { useState, useEffect, useRef } from 'react';
import type { PortfolioResponse, AlertTrigger, StrategyStatus, AgentStatus } from '../../../types/portfolio';

interface Props {
  portfolio: PortfolioResponse | null;
  activeAlerts: AlertTrigger[];
  strategies: StrategyStatus[];
  agents: AgentStatus[];
  loading: boolean;
  onClickStrategies: () => void;
  onClickAgents: () => void;
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPnL(amount: number, percent: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}$${formatMoney(Math.abs(amount))} (${sign}${percent.toFixed(2)}%)`;
}

export function PortfolioSummaryStrip({
  portfolio,
  activeAlerts,
  strategies,
  agents,
  loading,
  onClickStrategies,
  onClickAgents,
}: Props) {
  const [dayPnlFlash, setDayPnlFlash] = useState<'up' | 'down' | null>(null);
  const prevDayPnl = useRef<number | null>(null);

  useEffect(() => {
    if (!portfolio) return;
    const current = portfolio.day_pnl.amount;
    if (prevDayPnl.current !== null && current !== prevDayPnl.current) {
      setDayPnlFlash(current > prevDayPnl.current ? 'up' : 'down');
      const timer = setTimeout(() => setDayPnlFlash(null), 200);
      return () => clearTimeout(timer);
    }
    prevDayPnl.current = current;
  }, [portfolio?.day_pnl.amount]);

  const runningStrategies = strategies.filter((s) => s.status === 'running').length;
  const runningAgents = agents.filter((a) => a.status === 'running').length;

  if (loading && !portfolio) {
    return (
      <div className="poc-summary-strip poc-summary-loading">
        <span className="poc-summary-skeleton" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="poc-summary-strip">
        <span className="poc-summary-item poc-summary-error">Failed to load portfolio data</span>
      </div>
    );
  }

  return (
    <div className="poc-summary-strip">
      <div className="poc-summary-left">
        <div className="poc-summary-item poc-summary-total">
          <span className="poc-summary-label">Total Value</span>
          <span className="poc-summary-value poc-mono">${formatMoney(portfolio.total_value)}</span>
        </div>
        <div className="poc-summary-item">
          <span className="poc-summary-label">Cash</span>
          <span className="poc-summary-value poc-mono">${formatMoney(portfolio.cash)}</span>
        </div>
        <div className="poc-summary-item">
          <span className="poc-summary-label">Invested</span>
          <span className="poc-summary-value poc-mono">${formatMoney(portfolio.invested_value)}</span>
        </div>
        <div className="poc-summary-divider" />
        <div className="poc-summary-item">
          <span className="poc-summary-label">Day P&L</span>
          <span
            className={`poc-summary-value poc-mono poc-pnl ${portfolio.day_pnl.amount >= 0 ? 'positive' : 'negative'} ${dayPnlFlash === 'up' ? 'flash-up' : dayPnlFlash === 'down' ? 'flash-down' : ''}`}
          >
            {formatPnL(portfolio.day_pnl.amount, portfolio.day_pnl.percent)}
          </span>
        </div>
        <div className="poc-summary-item">
          <span className="poc-summary-label">Total P&L</span>
          <span
            className={`poc-summary-value poc-mono poc-pnl ${portfolio.total_pnl.amount >= 0 ? 'positive' : 'negative'}`}
          >
            {formatPnL(portfolio.total_pnl.amount, portfolio.total_pnl.percent)}
          </span>
        </div>
      </div>

      <div className="poc-summary-right">
        {(portfolio.margin_used ?? 0) > 0 && (
          <div className="poc-summary-item">
            <span className="poc-summary-label">Margin</span>
            <span className="poc-summary-value poc-mono">
              ${formatMoney(portfolio.margin_used)} / ${formatMoney(portfolio.margin_limit ?? 0)}
            </span>
          </div>
        )}
        <button className="poc-summary-btn" onClick={onClickStrategies}>
          <span className={`poc-status-dot ${runningStrategies > 0 ? 'running' : 'stopped'}`} />
          Strategies: {strategies.length}
        </button>
        <button className="poc-summary-btn" onClick={onClickAgents}>
          <span className={`poc-status-dot ${runningAgents > 0 ? 'running' : 'stopped'}`} />
          Agents: {agents.length}
        </button>
        <button className="poc-summary-btn poc-alert-trigger" data-alert-count={activeAlerts.length}>
          <span className={`poc-alert-badge ${activeAlerts.length > 0 ? 'has-alerts' : ''}`}>
            {activeAlerts.length}
          </span>
          Alerts
        </button>
      </div>
    </div>
  );
}
