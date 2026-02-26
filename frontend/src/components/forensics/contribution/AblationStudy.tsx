interface AblationStudyProps {
  ablation: {
    configuration: string;
    signals: number;
    trades: number;
    sharpe: number;
    delta_vs_full: number;
  }[];
}

export function AblationStudy({ ablation }: AblationStudyProps) {
  if (ablation.length === 0) return null;


  return (
    <div className="tf-ablation">
      <h5>Indicator Ablation Study</h5>
      <p className="tf-chart-subtitle">
        Systematically remove one indicator at a time to measure its contribution.
      </p>
      <table>
        <thead>
          <tr>
            <th>Configuration</th>
            <th>Signals</th>
            <th>Trades</th>
            <th>Sharpe</th>
            <th>vs Full</th>
          </tr>
        </thead>
        <tbody>
          {ablation.map((row) => {
            const isBaseline = row.delta_vs_full === 0;
            const impact =
              row.delta_vs_full < -0.15
                ? 'tf-ablation-high-impact'
                : row.delta_vs_full < -0.05
                  ? 'tf-ablation-medium-impact'
                  : 'tf-ablation-low-impact';

            return (
              <tr key={row.configuration} className={isBaseline ? 'tf-row-highlight' : ''}>
                <td>
                  {isBaseline ? (
                    <strong>{row.configuration}</strong>
                  ) : (
                    row.configuration
                  )}
                </td>
                <td className="mono">{row.signals}</td>
                <td className="mono">{row.trades}</td>
                <td className="mono">{row.sharpe.toFixed(2)}</td>
                <td className={`mono ${isBaseline ? '' : impact}`}>
                  {isBaseline
                    ? '\u2014'
                    : `${row.delta_vs_full >= 0 ? '+' : ''}${row.delta_vs_full.toFixed(2)}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Highlight the most impactful removal */}
      {ablation.length > 1 && (() => {
        const mostImpactful = ablation
          .filter((r) => r.delta_vs_full !== 0)
          .sort((a, b) => a.delta_vs_full - b.delta_vs_full)[0];
        const leastImpactful = ablation
          .filter((r) => r.delta_vs_full !== 0)
          .sort((a, b) => b.delta_vs_full - a.delta_vs_full)[0];

        return (
          <div className="tf-ablation-insights">
            {mostImpactful && (
              <div className="tf-ablation-insight">
                <strong>Most valuable:</strong> {mostImpactful.configuration} —
                removing it drops Sharpe by {Math.abs(mostImpactful.delta_vs_full).toFixed(2)}.
              </div>
            )}
            {leastImpactful && Math.abs(leastImpactful.delta_vs_full) < 0.05 && (
              <div className="tf-ablation-insight">
                <strong>Least valuable:</strong> {leastImpactful.configuration} —
                removing it only changes Sharpe by {Math.abs(leastImpactful.delta_vs_full).toFixed(2)}.
                Consider simplifying.
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
