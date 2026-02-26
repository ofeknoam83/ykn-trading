import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { OptimizationParameter, OptimizerGridCell, BacktestMetrics } from '../../../types/backtest';

interface BarChart1DProps {
  parameter: OptimizationParameter;
  cells: OptimizerGridCell[];
  targetMetric: string;
  onCellClick: (cell: OptimizerGridCell) => void;
}

function getMetricValue(metrics: BacktestMetrics, key: string): number {
  return (metrics as unknown as Record<string, number>)[key] ?? 0;
}

function barColor(value: number, min: number, max: number): string {
  if (max === min) return '#58a6ff';
  const ratio = (value - min) / (max - min);
  if (ratio >= 0.8) return '#238636';
  if (ratio >= 0.6) return '#2ea043';
  if (ratio >= 0.4) return '#d29922';
  if (ratio >= 0.2) return '#da3633';
  return '#8b1b1a';
}

export function BarChart1D({ parameter, cells, targetMetric, onCellClick }: BarChart1DProps) {
  const data = cells.map((cell) => {
    const paramVal = cell.param_values[parameter.key];
    const metricVal = getMetricValue(cell.metrics, targetMetric);
    return {
      param: String(paramVal),
      value: metricVal,
      cell,
    };
  }).sort((a, b) => {
    const an = Number(a.param);
    const bn = Number(b.param);
    if (!isNaN(an) && !isNaN(bn)) return an - bn;
    return a.param.localeCompare(b.param);
  });

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const bestIdx = values.indexOf(Math.max(...values));

  return (
    <div className="bt-barchart-section">
      <h4>{targetMetric.replace(/_/g, ' ')} by {parameter.label}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} onClick={(e: Record<string, unknown> | null) => {
          const payload = e as { activePayload?: { payload?: { cell?: OptimizerGridCell } }[] } | null;
          if (payload?.activePayload?.[0]?.payload?.cell) {
            onCellClick(payload.activePayload[0].payload.cell);
          }
        }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis dataKey="param" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 11 }} />
          <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} />
          <Tooltip
            contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
            formatter={(v: number | string | undefined) => [Number(v ?? 0).toFixed(2), targetMetric.replace(/_/g, ' ')]}
          />
          <Bar dataKey="value" cursor="pointer">
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={barColor(data[i].value, min, max)}
                stroke={i === bestIdx ? '#e6edf3' : 'transparent'}
                strokeWidth={i === bestIdx ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {data[bestIdx] && (
        <p className="bt-best-label">
          Best: <strong>{parameter.label} = {data[bestIdx].param}</strong> ({targetMetric.replace(/_/g, ' ')}: {data[bestIdx].value.toFixed(2)})
        </p>
      )}
    </div>
  );
}
