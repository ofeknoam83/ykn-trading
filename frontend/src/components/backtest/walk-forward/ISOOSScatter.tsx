import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { WalkForwardWindow } from '../../../types/backtest';

interface ISOOSScatterProps {
  windows: WalkForwardWindow[];
}

export function ISOOSScatter({ windows }: ISOOSScatterProps) {
  if (windows.length === 0) return null;

  const data = windows.map((w) => ({
    isSharpe: w.is_metrics.sharpe_ratio,
    oosSharpe: w.oos_metrics.sharpe_ratio,
    label: `W${w.window_number}`,
  }));

  const allValues = [...data.map((d) => d.isSharpe), ...data.map((d) => d.oosSharpe)];
  const maxVal = Math.max(...allValues, 1);
  const minVal = Math.min(...allValues, -0.5);

  return (
    <div className="bt-section">
      <h4>IS vs OOS Sharpe Comparison</h4>
      <p className="bt-section-desc">
        Points above the diagonal: OOS outperformed IS (good).
        Points below: OOS underperformed (overfitting signal).
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis
            dataKey="isSharpe"
            name="IS Sharpe"
            stroke="#8b949e"
            tick={{ fill: '#8b949e' }}
            domain={[minVal, maxVal]}
            label={{ value: 'In-Sample Sharpe', fill: '#8b949e', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            dataKey="oosSharpe"
            name="OOS Sharpe"
            stroke="#8b949e"
            tick={{ fill: '#8b949e' }}
            domain={[minVal, maxVal]}
            label={{ value: 'Out-of-Sample Sharpe', fill: '#8b949e', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
            formatter={((value: number, name: string) => [value.toFixed(2), name]) as never}
          />
          <ReferenceLine
            segment={[{ x: minVal, y: minVal }, { x: maxVal, y: maxVal }]}
            stroke="#58a6ff"
            strokeDasharray="5 5"
            label={{ value: 'Perfect agreement', fill: '#58a6ff', fontSize: 10 }}
          />
          <Scatter data={data} fill="#3fb950" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
