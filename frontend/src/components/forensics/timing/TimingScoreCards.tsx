interface TimingStats {
  entryAvg: number;
  entryMedian: number;
  entryStdDev: number;
  exitAvg: number;
  exitMedian: number;
  exitStdDev: number;
  overallAvg: number;
  actualReturnAvg: number;
  optimalReturnAvg: number;
  capturedAvg: number;
}

interface TimingScoreCardsProps {
  stats: TimingStats;
}

function getScoreLabel(pct: number): string {
  if (pct >= 0.75) return 'Excellent';
  if (pct >= 0.6) return 'Good';
  if (pct >= 0.4) return 'Fair';
  return 'Poor';
}

function getScoreClass(pct: number): string {
  if (pct >= 0.6) return 'bt-metric-positive';
  if (pct >= 0.4) return 'tf-metric-warning';
  return 'bt-metric-negative';
}

export function TimingScoreCards({ stats }: TimingScoreCardsProps) {
  return (
    <div className="tf-timing-scores">
      <div className="tf-score-hero">
        <div className="tf-score-value-large">
          <span className={getScoreClass(stats.overallAvg)}>
            {(stats.overallAvg * 100).toFixed(0)}%
          </span>
        </div>
        <div className="tf-score-label">
          Overall Timing Score ({getScoreLabel(stats.overallAvg)})
        </div>
      </div>

      <div className="tf-score-grid">
        <div className="tf-score-card">
          <h5>Entry Efficiency</h5>
          <div className="tf-score-metrics">
            <div className="tf-metric-row">
              <span>Average:</span>
              <span className={`mono ${getScoreClass(stats.entryAvg)}`}>
                {(stats.entryAvg * 100).toFixed(0)}%
              </span>
            </div>
            <div className="tf-metric-row">
              <span>Median:</span>
              <span className="mono">{(stats.entryMedian * 100).toFixed(0)}%</span>
            </div>
            <div className="tf-metric-row">
              <span>Std Dev:</span>
              <span className="mono">{(stats.entryStdDev * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="tf-score-card">
          <h5>Exit Efficiency</h5>
          <div className="tf-score-metrics">
            <div className="tf-metric-row">
              <span>Average:</span>
              <span className={`mono ${getScoreClass(stats.exitAvg)}`}>
                {(stats.exitAvg * 100).toFixed(0)}%
              </span>
            </div>
            <div className="tf-metric-row">
              <span>Median:</span>
              <span className="mono">{(stats.exitMedian * 100).toFixed(0)}%</span>
            </div>
            <div className="tf-metric-row">
              <span>Std Dev:</span>
              <span className="mono">{(stats.exitStdDev * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="tf-score-card">
          <h5>Return Capture</h5>
          <div className="tf-score-metrics">
            <div className="tf-metric-row">
              <span>Avg Actual:</span>
              <span className={`mono ${stats.actualReturnAvg >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                {(stats.actualReturnAvg * 100).toFixed(1)}%
              </span>
            </div>
            <div className="tf-metric-row">
              <span>Avg Optimal:</span>
              <span className="mono">{(stats.optimalReturnAvg * 100).toFixed(1)}%</span>
            </div>
            <div className="tf-metric-row">
              <span>Captured:</span>
              <span className={`mono ${getScoreClass(stats.capturedAvg)}`}>
                {(stats.capturedAvg * 100).toFixed(0)}% of available move
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
