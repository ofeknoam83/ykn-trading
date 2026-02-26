import type { WalkForwardWindow } from '../../../types/backtest';

interface WindowMetricsTableProps {
  windows: WalkForwardWindow[];
  reOptimize: boolean;
}

function gapColor(is_sharpe: number, oos_sharpe: number): string {
  const ratio = oos_sharpe / Math.max(is_sharpe, 0.01);
  if (ratio >= 0.8) return 'bt-metric-positive';
  if (ratio >= 0.5) return 'bt-metric-warn';
  return 'bt-metric-negative';
}

export function WindowMetricsTable({ windows, reOptimize }: WindowMetricsTableProps) {
  if (windows.length === 0) return null;

  const avgIsSharpe = windows.reduce((s, w) => s + w.is_metrics.sharpe_ratio, 0) / windows.length;
  const avgOosSharpe = windows.reduce((s, w) => s + w.oos_metrics.sharpe_ratio, 0) / windows.length;
  const avgOosReturn = windows.reduce((s, w) => s + w.oos_metrics.total_return, 0) / windows.length;
  const avgOosMdd = windows.reduce((s, w) => s + w.oos_metrics.max_drawdown, 0) / windows.length;

  return (
    <div className="bt-section">
      <h4>Per-Window Metrics</h4>
      <table className="bt-table bt-wf-table">
        <thead>
          <tr>
            <th>Window</th>
            <th>IS Period</th>
            <th>OOS Period</th>
            <th>IS Sharpe</th>
            <th>OOS Sharpe</th>
            <th>OOS Return</th>
            <th>OOS Max DD</th>
            {reOptimize && <th>Params Used</th>}
          </tr>
        </thead>
        <tbody>
          {windows.map((w) => (
            <tr key={w.window_number}>
              <td>W{w.window_number}</td>
              <td className="bt-date-cell">{w.is_start.slice(0, 10)} \u2013 {w.is_end.slice(0, 10)}</td>
              <td className="bt-date-cell">{w.oos_start.slice(0, 10)} \u2013 {w.oos_end.slice(0, 10)}</td>
              <td className="mono">{w.is_metrics.sharpe_ratio.toFixed(2)}</td>
              <td className={`mono ${gapColor(w.is_metrics.sharpe_ratio, w.oos_metrics.sharpe_ratio)}`}>
                {w.oos_metrics.sharpe_ratio.toFixed(2)}
              </td>
              <td className={`mono ${w.oos_metrics.total_return >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                {(w.oos_metrics.total_return * 100).toFixed(1)}%
              </td>
              <td className="mono bt-metric-negative">{(w.oos_metrics.max_drawdown * 100).toFixed(1)}%</td>
              {reOptimize && w.params_used && (
                <td className="mono bt-params-cell">
                  {Object.entries(w.params_used).map(([k, v]) => `${k}:${v}`).join(', ')}
                </td>
              )}
            </tr>
          ))}
          <tr className="bt-wf-avg-row">
            <td><strong>Avg</strong></td>
            <td></td>
            <td></td>
            <td className="mono"><strong>{avgIsSharpe.toFixed(2)}</strong></td>
            <td className={`mono ${gapColor(avgIsSharpe, avgOosSharpe)}`}><strong>{avgOosSharpe.toFixed(2)}</strong></td>
            <td className={`mono ${avgOosReturn >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
              <strong>{(avgOosReturn * 100).toFixed(1)}%</strong>
            </td>
            <td className="mono bt-metric-negative"><strong>{(avgOosMdd * 100).toFixed(1)}%</strong></td>
            {reOptimize && <td></td>}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
