import type { RegimePerformance } from '../../../types/backtest';
import { REGIME_CONFIG } from '../../../types/backtest';

interface RegimePerformanceTableProps {
  performance: RegimePerformance[];
}

export function RegimePerformanceTable({ performance }: RegimePerformanceTableProps) {
  if (performance.length === 0) return null;

  // Find the regime generating the most return
  const totalReturn = performance.reduce((sum, r) => sum + r.total_return, 0);
  const topRegime = performance.reduce((best, r) =>
    r.total_return > best.total_return ? r : best
  , performance[0]);

  return (
    <div className="bt-section">
      <h4>Performance by Regime</h4>
      <table className="bt-table">
        <thead>
          <tr>
            <th>Regime</th>
            <th>Days</th>
            <th>% of Time</th>
            <th>Return</th>
            <th>Annualized</th>
            <th>Sharpe</th>
            <th>Max DD</th>
            <th>Win Rate</th>
            <th>Trades</th>
          </tr>
        </thead>
        <tbody>
          {performance.map((r) => {
            const cfg = REGIME_CONFIG[r.regime];
            return (
              <tr key={r.regime}>
                <td>
                  <span className="bt-regime-badge" style={{ borderColor: cfg.color, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </td>
                <td>{r.days}</td>
                <td>{(r.pct_of_time * 100).toFixed(1)}%</td>
                <td className={`mono ${r.total_return >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                  {(r.total_return * 100).toFixed(2)}%
                </td>
                <td className={`mono ${r.annualized_return >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                  {(r.annualized_return * 100).toFixed(2)}%
                </td>
                <td className="mono">{r.sharpe.toFixed(2)}</td>
                <td className="mono bt-metric-negative">{(r.max_drawdown * 100).toFixed(2)}%</td>
                <td className="mono">{(r.win_rate * 100).toFixed(0)}%</td>
                <td>{r.trade_count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {totalReturn !== 0 && (
        <p className="bt-regime-insight">
          This strategy generates {((topRegime.total_return / totalReturn) * 100).toFixed(0)}% of its returns during{' '}
          <strong>{REGIME_CONFIG[topRegime.regime].label}</strong> regimes, which occur{' '}
          {(topRegime.pct_of_time * 100).toFixed(0)}% of the time.
        </p>
      )}
    </div>
  );
}
