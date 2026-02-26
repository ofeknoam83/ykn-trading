import type { BacktestSignalLog } from '../../../types/forensics';

interface SignalSummaryStatsProps {
  summary: BacktestSignalLog['summary'];
}

export function SignalSummaryStats({ summary }: SignalSummaryStatsProps) {
  const filterAccuracyPct = (summary.filter_accuracy * 100).toFixed(0);
  const incorrectPct = ((1 - summary.filter_accuracy) * 100).toFixed(0);
  const correctlyFiltered = Math.round(summary.filtered * summary.filter_accuracy);
  const incorrectlyFiltered = summary.filtered - correctlyFiltered;

  return (
    <div className="tf-signal-summary-stats">
      <h5>Signal Summary</h5>

      <div className="tf-summary-counts">
        <span>
          Total Signals: <strong>{summary.total}</strong>
        </span>
        <span className="tf-sep">|</span>
        <span>
          Executed: <strong>{summary.executed}</strong> ({((summary.executed / summary.total) * 100).toFixed(0)}%)
        </span>
        <span className="tf-sep">|</span>
        <span>
          Filtered: <strong>{summary.filtered}</strong>
        </span>
        <span className="tf-sep">|</span>
        <span>
          Weak: <strong>{summary.weak}</strong>
        </span>
        <span className="tf-sep">|</span>
        <span>
          Conflicted: <strong>{summary.conflicted}</strong>
        </span>
      </div>

      {summary.filtered > 0 && (
        <div className="tf-filter-accuracy">
          <h6>Filter Accuracy</h6>
          <div className="tf-accuracy-grid">
            <div className="tf-accuracy-item">
              <span className="tf-accuracy-label">Correctly filtered (would have lost):</span>
              <span className="bt-metric-positive">
                {correctlyFiltered} / {summary.filtered} = {filterAccuracyPct}% \u2705
              </span>
            </div>
            <div className="tf-accuracy-item">
              <span className="tf-accuracy-label">Incorrectly filtered (would have won):</span>
              <span className="bt-metric-negative">
                {incorrectlyFiltered} / {summary.filtered} = {incorrectPct}% \u26A0\uFE0F
              </span>
            </div>
            <div className="tf-accuracy-item">
              <span className="tf-accuracy-label">Missed P&L from incorrect filters:</span>
              <span className="bt-metric-positive">
                +${summary.missed_pnl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (estimated)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
