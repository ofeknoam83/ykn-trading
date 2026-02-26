interface IndividualPerformanceProps {
  performance: {
    indicator: string;
    signal_count: number;
    trade_count: number;
    win_rate: number;
    avg_return: number;
    sharpe: number;
    unique_value: number;
  }[];
}

export function IndividualPerformance({ performance }: IndividualPerformanceProps) {
  // Find the one with highest unique value
  const maxUnique = Math.max(...performance.map((p) => Math.abs(p.unique_value)));

  function uniqueLabel(value: number): { text: string; cls: string } {
    const absVal = Math.abs(value);
    if (absVal >= maxUnique * 0.8) return { text: 'High \u2605', cls: 'bt-metric-positive' };
    if (absVal >= maxUnique * 0.4) return { text: 'Medium', cls: 'tf-metric-warning' };
    return { text: 'Low', cls: 'bt-metric-negative' };
  }

  return (
    <div className="tf-individual-perf">
      <h5>Individual Signal Performance (if used alone)</h5>
      <table>
        <thead>
          <tr>
            <th>Indicator</th>
            <th>Signals</th>
            <th>Trades</th>
            <th>Win Rate</th>
            <th>Avg Return</th>
            <th>Sharpe</th>
            <th>Unique Value</th>
          </tr>
        </thead>
        <tbody>
          {performance.map((p) => {
            const uv = uniqueLabel(p.unique_value);
            return (
              <tr key={p.indicator}>
                <td className="mono">{p.indicator}</td>
                <td className="mono">{p.signal_count}</td>
                <td className="mono">{p.trade_count}</td>
                <td className="mono">{(p.win_rate * 100).toFixed(0)}%</td>
                <td className={`mono ${p.avg_return >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                  {(p.avg_return * 100).toFixed(1)}%
                </td>
                <td className="mono">{p.sharpe.toFixed(2)}</td>
                <td className={uv.cls}>{uv.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
