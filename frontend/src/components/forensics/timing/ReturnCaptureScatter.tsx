import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { TimingMetrics } from '../../../types/forensics';

interface ReturnCaptureScatterProps {
  metrics: TimingMetrics[];
  selectedTradeId: string | null;
  onSelectTrade: (tradeId: string) => void;
}

export function ReturnCaptureScatter({
  metrics,
  selectedTradeId,
  onSelectTrade,
}: ReturnCaptureScatterProps) {
  const data = metrics.map((m) => ({
    tradeId: m.trade_id,
    optimal: m.optimal_return * 100,
    actual: m.actual_return * 100,
    isSelected: m.trade_id === selectedTradeId,
  }));

  return (
    <div className="tf-return-scatter">
      <h5>Actual Return vs Optimal Return</h5>
      <p className="tf-chart-subtitle">
        Each dot is a trade. The diagonal line = perfect timing.
        Dots below = leaving money on the table.
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis
            dataKey="optimal"
            name="Optimal Return"
            stroke="#8b949e"
            tick={{ fill: '#8b949e', fontSize: 10 }}
            label={{ value: 'Optimal Return %', fill: '#8b949e', position: 'insideBottom', offset: -5 }}
            type="number"
          />
          <YAxis
            dataKey="actual"
            name="Actual Return"
            stroke="#8b949e"
            tick={{ fill: '#8b949e', fontSize: 10 }}
            label={{ value: 'Actual Return %', fill: '#8b949e', angle: -90, position: 'insideLeft' }}
            type="number"
          />
          <Tooltip
            contentStyle={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={((value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name === 'optimal' ? 'Optimal' : 'Actual',
            ]) as never}
          />
          {/* Perfect timing line */}
          <ReferenceLine
            segment={[
              { x: -20, y: -20 },
              { x: 30, y: 30 },
            ]}
            stroke="#8b949e"
            strokeDasharray="5 3"
            strokeWidth={1}
          />
          <Scatter
            data={data}
            onClick={(point) => {
              if (point?.tradeId) onSelectTrade(point.tradeId as string);
            }}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isSelected ? '#f0883e' : entry.actual >= 0 ? '#3fb950' : '#f85149'}
                r={entry.isSelected ? 6 : 4}
                stroke={entry.isSelected ? '#fff' : 'none'}
                strokeWidth={entry.isSelected ? 2 : 0}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
