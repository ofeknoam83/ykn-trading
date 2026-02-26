import type { RegimeTransition } from '../../../types/backtest';
import { REGIME_CONFIG } from '../../../types/backtest';

interface RegimeTransitionTableProps {
  transitions: RegimeTransition[];
}

export function RegimeTransitionTable({ transitions }: RegimeTransitionTableProps) {
  if (transitions.length === 0) return null;

  return (
    <div className="bt-section">
      <h4>Regime Transition Impact</h4>
      <p className="bt-section-desc">
        How the strategy performs when market regimes change.
      </p>
      <table className="bt-table">
        <thead>
          <tr>
            <th>Transition</th>
            <th>Avg Return (5d after)</th>
            <th>Avg Return (20d after)</th>
            <th>Frequency</th>
          </tr>
        </thead>
        <tbody>
          {transitions.map((t, i) => {
            const fromCfg = REGIME_CONFIG[t.from];
            const toCfg = REGIME_CONFIG[t.to];
            return (
              <tr key={i}>
                <td>
                  <span style={{ color: fromCfg.color }}>{fromCfg.label}</span>
                  {' \u2192 '}
                  <span style={{ color: toCfg.color }}>{toCfg.label}</span>
                </td>
                <td className={`mono ${t.avg_return_5d >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                  {(t.avg_return_5d * 100).toFixed(2)}%
                </td>
                <td className={`mono ${t.avg_return_20d >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                  {(t.avg_return_20d * 100).toFixed(2)}%
                </td>
                <td>{t.frequency} times</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
