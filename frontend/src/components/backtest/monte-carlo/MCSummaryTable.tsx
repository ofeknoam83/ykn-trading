interface MCSummaryTableProps {
  summary: {
    metric: string;
    actual: number;
    median: number;
    pct_5: number;
    pct_95: number;
    actual_percentile: number;
  }[];
}

function formatVal(value: number, metric: string): string {
  const lower = metric.toLowerCase();
  if (lower.includes('return') || lower.includes('drawdown') || lower.includes('rate')) {
    return `${(value * 100).toFixed(2)}%`;
  }
  return value.toFixed(2);
}

export function MCSummaryTable({ summary }: MCSummaryTableProps) {
  if (summary.length === 0) return null;

  return (
    <div className="bt-section">
      <h4>Monte Carlo Summary Statistics</h4>
      <table className="bt-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Actual</th>
            <th>Median (MC)</th>
            <th>5th Pctile</th>
            <th>95th Pctile</th>
            <th>Actual Pctile</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((s) => (
            <tr key={s.metric}>
              <td>{s.metric}</td>
              <td className="mono">{formatVal(s.actual, s.metric)}</td>
              <td className="mono">{formatVal(s.median, s.metric)}</td>
              <td className="mono">{formatVal(s.pct_5, s.metric)}</td>
              <td className="mono">{formatVal(s.pct_95, s.metric)}</td>
              <td className="mono">
                <span className={
                  s.actual_percentile >= 90 ? 'bt-metric-positive'
                  : s.actual_percentile <= 10 ? 'bt-metric-negative'
                  : ''
                }>
                  {s.actual_percentile.toFixed(0)}th
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
