import type { SignalEvent, SignalOutcome } from '../../../types/forensics';

interface SignalCardProps {
  signal: SignalEvent;
  onNavigateToReplay?: () => void;
  onNavigateToWhatIf?: () => void;
}

const OUTCOME_CONFIG: Record<
  SignalOutcome,
  { label: string; icon: string; color: string; bgClass: string }
> = {
  executed: { label: 'EXECUTED', icon: '\u{1F7E2}', color: '#3fb950', bgClass: 'tf-signal-executed' },
  filtered: { label: 'FILTERED', icon: '\u{1F535}', color: '#58a6ff', bgClass: 'tf-signal-filtered' },
  weak: { label: 'WEAK', icon: '\u26AA', color: '#8b949e', bgClass: 'tf-signal-weak' },
  conflicted: { label: 'CONFLICTED', icon: '\u{1F7E1}', color: '#d29922', bgClass: 'tf-signal-conflicted' },
};

export function SignalCard({ signal, onNavigateToReplay, onNavigateToWhatIf }: SignalCardProps) {
  const config = OUTCOME_CONFIG[signal.outcome];

  const isTopHypothetical =
    signal.hypothetical &&
    signal.outcome !== 'executed' &&
    signal.hypothetical.best_exit_return > 0.05;

  return (
    <div className={`tf-signal-card ${config.bgClass}`}>
      <div className="tf-signal-card-header">
        <span className="tf-signal-timestamp">
          {new Date(signal.timestamp).toLocaleDateString()} {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="tf-signal-outcome" style={{ color: config.color }}>
          {config.icon} {config.label} — {signal.direction.toUpperCase()} {signal.symbol}
        </span>
      </div>

      <div className="tf-signal-card-body">
        <div className="tf-signal-trigger">
          <span className="tf-detail-label">Signal:</span>{' '}
          {signal.trigger.description}
        </div>

        <div className="tf-signal-votes">
          <span className="tf-detail-label">
            Strength: {Math.round(signal.strength * (signal.indicator_votes.length || 1))}/
            {signal.indicator_votes.length || '?'}
          </span>
          <span className="tf-vote-icons">
            {signal.indicator_votes.map((v, i) => (
              <span
                key={i}
                className={`tf-vote-chip ${v.agrees_with_signal ? 'tf-vote-agree' : 'tf-vote-disagree'}`}
                title={`${v.indicator}: ${v.reason}`}
              >
                {v.agrees_with_signal ? '\u2705' : '\u274C'} {v.indicator}
              </span>
            ))}
          </span>
        </div>

        {signal.outcome !== 'executed' && signal.filter_reason && (
          <div className="tf-signal-reason">
            <span className="tf-detail-label">Reason filtered:</span>{' '}
            {signal.filter_reason}
          </div>
        )}

        {signal.conflict_detail && (
          <div className="tf-signal-conflict">
            <span className="tf-detail-label">Conflict:</span>{' '}
            {signal.conflict_detail}
          </div>
        )}

        {signal.hypothetical && signal.outcome !== 'executed' && (
          <div className="tf-signal-hypothetical">
            <span className="tf-detail-label">Hypothetical:</span>{' '}
            If executed, would have returned{' '}
            <span
              className={
                signal.hypothetical.return_5d >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'
              }
            >
              {signal.hypothetical.return_5d >= 0 ? '+' : ''}
              {(signal.hypothetical.return_5d * 100).toFixed(1)}% in 5 days
            </span>
            {', '}
            <span
              className={
                signal.hypothetical.return_10d >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'
              }
            >
              {signal.hypothetical.return_10d >= 0 ? '+' : ''}
              {(signal.hypothetical.return_10d * 100).toFixed(1)}% in 10 days
            </span>
          </div>
        )}

        {isTopHypothetical && (
          <div className="tf-signal-callout">
            \u26A0\uFE0F This filtered signal would have been a top trade.
            Consider relaxing the filter that rejected it.
          </div>
        )}
      </div>

      <div className="tf-signal-card-actions">
        {onNavigateToReplay && (
          <button className="bt-action-btn" onClick={onNavigateToReplay}>
            View in Trade Replay \u2192
          </button>
        )}
        {onNavigateToWhatIf && signal.outcome !== 'executed' && (
          <button className="bt-action-btn" onClick={onNavigateToWhatIf}>
            Run What-If \u2192
          </button>
        )}
      </div>
    </div>
  );
}
