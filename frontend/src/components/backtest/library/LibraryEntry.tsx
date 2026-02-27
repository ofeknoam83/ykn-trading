import type { LibraryEntry } from '../../../types/backtest';

interface LibraryEntryCardProps {
  entry: LibraryEntry;
  onView: () => void;
  onCompare: () => void;
  onReRun: () => void;
  onEdit?: (update: { name?: string; notes?: string; tags?: string[] }) => void;
  onDelete: () => void;
}

export function LibraryEntryCard({ entry, onView, onCompare, onReRun, onEdit, onDelete }: LibraryEntryCardProps) {
  const m = entry.summary_metrics;

  return (
    <div className="bt-library-card">
      <div className="bt-library-card-header">
        <span className="bt-library-name">{entry.name}</span>
        <span className="bt-library-date">{entry.created_at.slice(0, 10)}</span>
      </div>

      <div className="bt-library-card-metrics">
        <span>Sharpe: <strong className={m.sharpe >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}>{m.sharpe.toFixed(2)}</strong></span>
        <span className="bt-result-metric-sep">|</span>
        <span>Return: <strong className={m.total_return >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}>{(m.total_return * 100).toFixed(1)}%</strong></span>
        <span className="bt-result-metric-sep">|</span>
        <span>MDD: <strong className="bt-metric-negative">{(m.max_drawdown * 100).toFixed(1)}%</strong></span>
      </div>

      <div className="bt-library-card-config">
        <span>Assets: {entry.config.assets.join(', ')}</span>
        <span>Range: {entry.config.date_range.start.slice(0, 10)} \u2013 {entry.config.date_range.end.slice(0, 10)}</span>
        <span>Interval: {entry.config.interval}</span>
      </div>

      {entry.analysis.has_walk_forward && entry.analysis.walk_forward_stability != null && (
        <span className="bt-library-badge bt-badge-wf">
          WF Stability: {entry.analysis.walk_forward_stability.toFixed(0)}%
        </span>
      )}
      {entry.analysis.has_monte_carlo && entry.analysis.monte_carlo_significance != null && (
        <span className="bt-library-badge bt-badge-mc">
          MC Significance: {entry.analysis.monte_carlo_significance.toFixed(0)}%
        </span>
      )}

      {entry.tags.length > 0 && (
        <div className="bt-library-tags">
          {entry.tags.map((tag) => (
            <span key={tag} className="bt-tag">{tag}</span>
          ))}
        </div>
      )}

      {entry.notes && <p className="bt-library-notes">{entry.notes}</p>}

      <div className="bt-library-card-actions">
        <button className="bt-action-btn" onClick={onView}>View</button>
        <button className="bt-action-btn" onClick={onCompare}>Compare</button>
        <button className="bt-action-btn" onClick={onReRun}>Re-Run</button>
        {onEdit && (
          <button
            className="bt-action-btn"
            onClick={() => {
              const newName = prompt('Rename entry:', entry.name);
              if (newName && newName !== entry.name) {
                onEdit({ name: newName });
              }
            }}
          >
            Edit
          </button>
        )}
        <button className="bt-action-btn bt-action-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
