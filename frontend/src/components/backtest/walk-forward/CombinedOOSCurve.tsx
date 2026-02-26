import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { TimeSeriesPoint, WalkForwardWindow } from '../../../types/backtest';

interface CombinedOOSCurveProps {
  equityCurve: TimeSeriesPoint[];
  windows: WalkForwardWindow[];
}

export function CombinedOOSCurve({ equityCurve, windows }: CombinedOOSCurveProps) {
  if (equityCurve.length === 0) return null;

  const data = equityCurve.map((p) => ({
    date: p.date.slice(0, 10),
    strategy: p.strategy_value,
    benchmark: p.benchmark_value,
  }));

  const boundaries = windows.map((w) => w.oos_start.slice(0, 10));

  return (
    <div className="bt-section">
      <h4>Combined Out-of-Sample Equity Curve</h4>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis dataKey="date" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
          <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
          {boundaries.map((date, i) => (
            <ReferenceLine
              key={i}
              x={date}
              stroke="#30363d"
              strokeDasharray="3 3"
              label={{ value: `W${i + 1}`, fill: '#8b949e', fontSize: 10, position: 'top' }}
            />
          ))}
          <Line type="monotone" dataKey="strategy" stroke="#58a6ff" strokeWidth={2} dot={false} name="Strategy (OOS)" />
          <Line type="monotone" dataKey="benchmark" stroke="#8b949e" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Benchmark" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
