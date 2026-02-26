import { useMemo } from 'react';
import { useScannerStore } from '../stores/scannerStore';

const SECTORS = ['Tech', 'Health', 'Fin', 'Energy', 'Consumer', 'Industrial', 'Utilities', 'Materials', 'Real Estate', 'Comm', 'Staples'];
const SIGNAL_TYPES = ['Momentum', 'Reversion', 'Breakout', 'Anomaly', 'Convergence'];

export function OpportunityHeatmap() {
  const { heatmapData } = useScannerStore();

  const grid = useMemo(() => {
    const map = new Map<string, number>();
    for (const cell of heatmapData) {
      map.set(`${cell.sector}:${cell.signalType}`, cell.count);
    }
    return map;
  }, [heatmapData]);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const count of grid.values()) {
      if (count > max) max = count;
    }
    return max || 1;
  }, [grid]);

  const getCellColor = (count: number) => {
    if (count === 0) return '#0d1117';
    const intensity = Math.min(count / maxCount, 1);
    const r = Math.round(88 + intensity * (63 - 88));
    const g = Math.round(166 + intensity * (185 - 166));
    const b = Math.round(255 + intensity * (80 - 255));
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="sc-card">
      <div className="sc-card-header">
        <span className="sc-card-title">Opportunity Heatmap</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="sc-heatmap">
          <thead>
            <tr>
              <th />
              {SIGNAL_TYPES.map((st) => (
                <th key={st}>{st}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTORS.map((sector) => (
              <tr key={sector}>
                <th style={{ textAlign: 'left' }}>{sector}</th>
                {SIGNAL_TYPES.map((st) => {
                  const count = grid.get(`${sector}:${st}`) ?? 0;
                  return (
                    <td
                      key={st}
                      style={{ backgroundColor: getCellColor(count) }}
                      title={`${sector} / ${st}: ${count} matches`}
                    >
                      {count > 0 ? count : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
