import type { OptimizationParameter, OptimizerGridCell, BacktestResult } from '../../../types/backtest';
import { getBacktestResult } from '../../../api/backtestApi';

interface TopNTableProps {
  cells: OptimizerGridCell[];
  parameters: OptimizationParameter[];
  targetMetric: string;
  onCellClick: (cell: OptimizerGridCell) => void;
  onCompare?: (result: BacktestResult) => void;
  onPin?: (result: BacktestResult) => void;
}

export function TopNTable({ cells, parameters, targetMetric: _targetMetric, onCellClick, onCompare, onPin }: TopNTableProps) {
  if (cells.length === 0) return null;

  async function handleAction(cell: OptimizerGridCell, action: 'compare' | 'pin') {
    try {
      const result = await getBacktestResult(cell.result_id);
      if (action === 'compare') onCompare?.(result);
      else onPin?.(result);
    } catch { /* */ }
  }

  return (
    <div className="bt-section">
      <h4>Top {Math.min(10, cells.length)} Configurations</h4>
      <table className="bt-table bt-topn-table">
        <thead>
          <tr>
            <th>Rank</th>
            {parameters.map((p) => <th key={p.key}>{p.label}</th>)}
            <th>Sharpe</th>
            <th>Return</th>
            <th>Max DD</th>
            <th>Sortino</th>
            <th>Profit Factor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cells.slice(0, 10).map((cell, i) => {
            const m = cell.metrics;
            return (
              <tr
                key={i}
                className={`bt-topn-row ${i === 0 ? 'bt-topn-best' : ''}`}
                onClick={() => onCellClick(cell)}
              >
                <td>{i === 0 ? '\u2605 1' : i + 1}</td>
                {parameters.map((p) => (
                  <td key={p.key} className="mono">{String(cell.param_values[p.key])}</td>
                ))}
                <td className="mono">{m.sharpe_ratio.toFixed(2)}</td>
                <td className={`mono ${m.total_return >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                  {(m.total_return * 100).toFixed(1)}%
                </td>
                <td className="mono bt-metric-negative">{(m.max_drawdown * 100).toFixed(1)}%</td>
                <td className="mono">{m.sortino_ratio.toFixed(2)}</td>
                <td className="mono">{m.profit_factor.toFixed(2)}</td>
                <td className="bt-topn-actions" onClick={(e) => e.stopPropagation()}>
                  {onPin && (
                    <button className="bt-action-btn" onClick={() => handleAction(cell, 'pin')}>Pin</button>
                  )}
                  {onCompare && (
                    <button className="bt-action-btn" onClick={() => handleAction(cell, 'compare')}>Compare</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
