import { useMemo } from 'react';
import type { Position } from '../../../types/portfolio';

interface Props {
  positions: Position[];
}

export function OptionsGreeksSummary({ positions }: Props) {
  const greeks = useMemo(() => {
    const optionPositions = positions.filter((p) => p.asset_class === 'option' && p.greeks);
    if (optionPositions.length === 0) return null;

    let netDelta = 0;
    let netGamma = 0;
    let netTheta = 0;
    let netVega = 0;

    const byUnderlying = new Map<string, { delta: number; contracts: number }>();

    for (const pos of optionPositions) {
      const g = pos.greeks!;
      const multiplier = pos.side === 'long' ? pos.quantity : -pos.quantity;
      netDelta += g.delta * multiplier;
      netGamma += g.gamma * multiplier;
      netTheta += g.theta * multiplier;
      netVega += g.vega * multiplier;

      const sym = pos.symbol.replace(/\d{6}[CP]\d+/, '').trim() || pos.symbol;
      const existing = byUnderlying.get(sym) ?? { delta: 0, contracts: 0 };
      existing.delta += g.delta * multiplier;
      existing.contracts += pos.quantity;
      byUnderlying.set(sym, existing);
    }

    return {
      netDelta,
      netGamma,
      netTheta,
      netVega,
      byUnderlying: Array.from(byUnderlying.entries()).map(([symbol, data]) => ({
        symbol,
        ...data,
      })),
    };
  }, [positions]);

  if (!greeks) return null;

  return (
    <div className="poc-risk-widget poc-greeks-summary">
      <h4 className="poc-widget-title">Options Greeks (Aggregate)</h4>
      <div className="poc-greeks-grid">
        <div className="poc-greeks-item">
          <span className="poc-greeks-label">Net Delta</span>
          <span className="poc-greeks-value poc-mono">
            {greeks.netDelta >= 0 ? '+' : ''}{greeks.netDelta.toFixed(1)}
          </span>
        </div>
        <div className="poc-greeks-item">
          <span className="poc-greeks-label">Net Gamma</span>
          <span className="poc-greeks-value poc-mono">
            {greeks.netGamma >= 0 ? '+' : ''}{greeks.netGamma.toFixed(2)}
          </span>
        </div>
        <div className="poc-greeks-item">
          <span className="poc-greeks-label">Net Theta</span>
          <span className="poc-greeks-value poc-mono negative">
            ${greeks.netTheta.toFixed(2)}/day
          </span>
        </div>
        <div className="poc-greeks-item">
          <span className="poc-greeks-label">Net Vega</span>
          <span className="poc-greeks-value poc-mono">
            {greeks.netVega >= 0 ? '+' : ''}{greeks.netVega.toFixed(1)}
          </span>
        </div>
      </div>

      {greeks.byUnderlying.length > 0 && (
        <div className="poc-greeks-underlying">
          <h5>Delta Exposure by Underlying</h5>
          {greeks.byUnderlying.map((u) => (
            <div key={u.symbol} className="poc-underlying-row">
              <span className="poc-underlying-symbol">{u.symbol}</span>
              <span className="poc-mono">
                {u.delta >= 0 ? '+' : ''}{u.delta.toFixed(1)} \u0394
              </span>
              <span className="poc-muted">({u.contracts} contracts)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
