import { useMemo, useState } from 'react';
import type { OptimizationParameter, OptimizerGridCell, BacktestMetrics } from '../../../types/backtest';

interface HeatmapChartProps {
  parameters: OptimizationParameter[];
  cells: OptimizerGridCell[];
  targetMetric: string;
  onCellClick: (cell: OptimizerGridCell) => void;
}

function getMetricValue(metrics: BacktestMetrics, key: string): number {
  return (metrics as unknown as Record<string, number>)[key] ?? 0;
}

function interpolateColor(value: number, min: number, max: number): string {
  if (max === min) return '#30363d';
  const ratio = (value - min) / (max - min);
  if (ratio >= 0.8) return '#238636';
  if (ratio >= 0.6) return '#2ea043';
  if (ratio >= 0.4) return '#d29922';
  if (ratio >= 0.2) return '#da3633';
  return '#8b1b1a';
}

export function HeatmapChart({ parameters, cells, targetMetric, onCellClick }: HeatmapChartProps) {
  const [sliceIndex, setSliceIndex] = useState(0);

  const { xParam, yParam, sliceParam, xValues, yValues, sliceValues, gridMap, minVal, maxVal, bestCell } = useMemo(() => {
    const xParam = parameters[0];
    const yParam = parameters[1];
    const sliceParam = parameters.length >= 3 ? parameters[2] : undefined;

    const xVals = getParamValues(xParam);
    const yVals = getParamValues(yParam);
    const sliceVals = sliceParam ? getParamValues(sliceParam) : [''];

    const gridMap = new Map<string, OptimizerGridCell>();
    let min = Infinity, max = -Infinity;
    let best: OptimizerGridCell | null = null;

    for (const cell of cells) {
      const key = `${cell.param_values[xParam.key]}-${cell.param_values[yParam.key]}${sliceParam ? `-${cell.param_values[sliceParam.key]}` : ''}`;
      gridMap.set(key, cell);
      const val = getMetricValue(cell.metrics, targetMetric);
      if (val < min) min = val;
      if (val > max) max = val;
      if (!best || val > getMetricValue(best.metrics, targetMetric)) best = cell;
    }

    return { xParam, yParam, sliceParam, xValues: xVals, yValues: yVals, sliceValues: sliceVals, gridMap, minVal: min, maxVal: max, bestCell: best };
  }, [parameters, cells, targetMetric]);

  const currentSlice = sliceValues[sliceIndex] ?? '';

  return (
    <div className="bt-heatmap-section">
      <h4>Optimization Heatmap — {targetMetric.replace(/_/g, ' ')}</h4>

      {sliceParam && sliceValues.length > 1 && (
        <div className="bt-slice-selector">
          <span className="bt-slice-label">{sliceParam.label}:</span>
          {sliceValues.map((val, i) => (
            <button
              key={i}
              className={`bt-pill ${i === sliceIndex ? 'bt-pill-active' : ''}`}
              onClick={() => setSliceIndex(i)}
            >
              {String(val)}
            </button>
          ))}
        </div>
      )}

      <div className="bt-heatmap-grid">
        <table className="bt-heatmap-table">
          <thead>
            <tr>
              <th className="bt-hm-corner">{yParam.label} \\ {xParam.label}</th>
              {xValues.map((xv) => (
                <th key={String(xv)} className="bt-hm-header">{String(xv)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yValues.map((yv) => (
              <tr key={String(yv)}>
                <td className="bt-hm-row-header">{String(yv)}</td>
                {xValues.map((xv) => {
                  const key = `${xv}-${yv}${sliceParam ? `-${currentSlice}` : ''}`;
                  const cell = gridMap.get(key);
                  if (!cell) {
                    return <td key={String(xv)} className="bt-hm-cell bt-hm-empty" />;
                  }
                  const val = getMetricValue(cell.metrics, targetMetric);
                  const isBest = bestCell && cell === bestCell;
                  return (
                    <td
                      key={String(xv)}
                      className={`bt-hm-cell bt-hm-value ${isBest ? 'bt-hm-best' : ''}`}
                      style={{ background: interpolateColor(val, minVal, maxVal) }}
                      onClick={() => onCellClick(cell)}
                      title={`${xParam.label}: ${xv}, ${yParam.label}: ${yv}\n${targetMetric}: ${formatVal(val, targetMetric)}\nReturn: ${(cell.metrics.total_return * 100).toFixed(1)}%\nMDD: ${(cell.metrics.max_drawdown * 100).toFixed(1)}%`}
                    >
                      {isBest && '\u2605 '}
                      {formatVal(val, targetMetric)}
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

function getParamValues(param: OptimizationParameter): (string | number)[] {
  if (param.type === 'enum' && param.values) return param.values;
  if (param.type === 'range' && param.from != null && param.to != null && param.step) {
    const vals: number[] = [];
    for (let v = param.from; v <= param.to; v += param.step) {
      vals.push(v);
    }
    return vals;
  }
  return [];
}

function formatVal(value: number, metric: string): string {
  if (metric.includes('return') || metric.includes('drawdown') || metric.includes('win_rate')) {
    return `${(value * 100).toFixed(1)}%`;
  }
  return value.toFixed(2);
}
