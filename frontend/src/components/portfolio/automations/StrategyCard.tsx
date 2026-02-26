import { useState } from 'react';
import type { StrategyStatus } from '../../../types/portfolio';
import { pauseStrategy, resumeStrategy, stopStrategy } from '../../../api/portfolioApi';

interface Props {
  strategy: StrategyStatus;
  onRefresh: () => void;
}

function formatPnL(amount: number, percent: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} (${sign}${percent.toFixed(2)}%)`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_COLORS: Record<string, string> = {
  running: 'running',
  paused: 'paused',
  stopped: 'stopped',
  error: 'error',
};

export function StrategyCard({ strategy, onRefresh }: Props) {
  const [acting, setActing] = useState(false);

  async function handlePause() {
    setActing(true);
    try {
      if (strategy.status === 'paused') {
        await resumeStrategy(strategy.id);
      } else {
        await pauseStrategy(strategy.id);
      }
      onRefresh();
    } finally {
      setActing(false);
    }
  }

  async function handleStop() {
    if (!confirm(`Stop ${strategy.name}? Active positions will remain open but no new trades will be placed.`)) return;
    setActing(true);
    try {
      await stopStrategy(strategy.id);
      onRefresh();
    } finally {
      setActing(false);
    }
  }

  return (
    <div className={`poc-auto-card poc-auto-${STATUS_COLORS[strategy.status] ?? 'stopped'}`}>
      <div className="poc-auto-card-header">
        <span className="poc-auto-icon">{'\u{1F4C8}'}</span>
        <span className="poc-auto-name">{strategy.name}</span>
        <span className={`poc-status-dot ${strategy.status}`} title={strategy.status} />
      </div>

      <div className="poc-auto-card-body">
        <div className="poc-auto-meta">
          <span>Status: <strong>{strategy.status.charAt(0).toUpperCase() + strategy.status.slice(1)}</strong></span>
          <span>Since: {formatDate(strategy.started_at)}</span>
        </div>
        <div className="poc-auto-meta">
          <span>Type: {strategy.type}</span>
          <span>Positions: {strategy.positions_count}</span>
        </div>
        <div className="poc-auto-pnl">
          <span className={`poc-pnl ${strategy.day_pnl.amount >= 0 ? 'positive' : 'negative'}`}>
            Day: {formatPnL(strategy.day_pnl.amount, strategy.day_pnl.percent)}
          </span>
          <span className={`poc-pnl ${strategy.total_pnl.amount >= 0 ? 'positive' : 'negative'}`}>
            Total: {formatPnL(strategy.total_pnl.amount, strategy.total_pnl.percent)}
          </span>
        </div>
        {strategy.last_action && (
          <div className="poc-auto-last-action poc-muted">Last: {strategy.last_action}</div>
        )}
        {strategy.next_scheduled && (
          <div className="poc-auto-next poc-muted">Next: {strategy.next_scheduled}</div>
        )}
      </div>

      <div className="poc-auto-card-actions">
        <button
          className={`poc-btn-sm ${strategy.status === 'paused' ? 'poc-btn-primary' : 'poc-btn-warning'}`}
          onClick={handlePause}
          disabled={acting || strategy.status === 'stopped'}
        >
          {strategy.status === 'paused' ? '\u25B6 Resume' : '\u23F8 Pause'}
        </button>
        <button className="poc-btn-sm poc-btn-ghost">Details</button>
        <button
          className="poc-btn-sm poc-btn-danger-ghost"
          onClick={handleStop}
          disabled={acting || strategy.status === 'stopped'}
        >
          Stop
        </button>
      </div>
    </div>
  );
}
