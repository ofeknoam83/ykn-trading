import type { AgentAlphaAnalysis } from '../../../types/forensics';

interface HoldDecisionAnalysisProps {
  holdDecisions: AgentAlphaAnalysis['hold_decisions'];
}

export function HoldDecisionAnalysis({ holdDecisions }: HoldDecisionAnalysisProps) {
  const correctHolds = holdDecisions.filter((h) => h.was_correct).length;
  const incorrectHolds = holdDecisions.length - correctHolds;

  return (
    <div className="tf-hold-analysis">
      <h5>Hold Decision Analysis</h5>
      <p className="tf-chart-subtitle">
        HOLD decisions are as important as trades. Was the agent right to stay flat?
      </p>

      <div className="tf-hold-summary">
        <span>
          Total hold decisions: <strong>{holdDecisions.length}</strong>
        </span>
        <span className="tf-sep">|</span>
        <span className="bt-metric-positive">
          Correct: {correctHolds} ({((correctHolds / holdDecisions.length) * 100).toFixed(0)}%)
        </span>
        <span className="tf-sep">|</span>
        <span className="bt-metric-negative">
          Incorrect: {incorrectHolds} ({((incorrectHolds / holdDecisions.length) * 100).toFixed(0)}%)
        </span>
      </div>

      <div className="tf-hold-list">
        {holdDecisions.map((h) => (
          <div key={h.decision_id} className={`tf-hold-card ${h.was_correct ? 'tf-hold-correct' : 'tf-hold-incorrect'}`}>
            <div className="tf-hold-header">
              <span className="tf-hold-icon">
                {h.was_correct ? '\u2705' : '\u274C'}
              </span>
              <span className="tf-hold-date">
                {new Date(h.timestamp).toLocaleDateString()}
              </span>
              <span className="tf-hold-confidence">Confidence: {h.confidence}%</span>
              <span className={`tf-hold-verdict ${h.was_correct ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                {h.was_correct ? 'Correct hold' : 'Missed opportunity'}
              </span>
            </div>
            <div className="tf-hold-reasoning">{h.reasoning_summary}</div>
            {h.hypothetical_best_trade_return !== undefined && (
              <div className="tf-hold-hypothetical">
                Best trade if acted:{' '}
                <span className={h.hypothetical_best_trade_return >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}>
                  {(h.hypothetical_best_trade_return * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
