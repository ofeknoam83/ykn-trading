import type { BacktestResult } from '../../../types/backtest';

interface ResultCardProps {
  result: BacktestResult;
  isPinned?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onCompare?: () => void;
  onSave?: () => void;
}

export function ResultCard({
  result,
  isPinned,
  isActive,
  onClick,
  onPin,
  onUnpin,
  onCompare,
  onSave,
}: ResultCardProps) {
  const m = result.metrics;

  return (
    <div
      className={`bt-result-card ${isActive ? 'bt-result-card-active' : ''} ${isPinned ? 'bt-result-card-pinned' : ''}`}
      onClick={onClick}
    >
      <div className="bt-result-card-header">
        <span className="bt-result-name">{result.name}</span>
        <span className="bt-result-date">{result.created_at.slice(0, 10)}</span>
      </div>
      <div className="bt-result-card-metrics">
        <span className="bt-result-metric">
          Sharpe <strong className={m.sharpe_ratio >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}>{m.sharpe_ratio.toFixed(2)}</strong>
        </span>
        <span className="bt-result-metric-sep">|</span>
        <span className="bt-result-metric">
          Return <strong className={m.total_return >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}>{(m.total_return * 100).toFixed(1)}%</strong>
        </span>
        <span className="bt-result-metric-sep">|</span>
        <span className="bt-result-metric">
          MDD <strong className="bt-metric-negative">{(m.max_drawdown * 100).toFixed(1)}%</strong>
        </span>
      </div>
      <div className="bt-result-card-actions" onClick={(e) => e.stopPropagation()}>
        {isPinned ? (
          <button className="bt-action-btn" onClick={onUnpin} title="Unpin">
            Unpin
          </button>
        ) : (
          <button className="bt-action-btn" onClick={onPin} title="Pin">
            Pin
          </button>
        )}
        <button className="bt-action-btn" onClick={onSave} title="Save to Library">
          Save
        </button>
        <button className="bt-action-btn" onClick={onCompare} title="Compare">
          Compare
        </button>
      </div>
    </div>
  );
}
