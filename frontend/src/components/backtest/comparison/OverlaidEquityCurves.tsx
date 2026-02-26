import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { BacktestResult } from '../../../types/backtest';

interface OverlaidEquityCurvesProps {
  results: BacktestResult[];
  colors: string[];
}

export function OverlaidEquityCurves({ results, colors }: OverlaidEquityCurvesProps) {
  // Normalize all equity curves to start at the same value
  const allDates = new Set<string>();
  results.forEach((r) => r.equity_curve.forEach((p) => allDates.add(p.date.slice(0, 10))));
  const sortedDates = [...allDates].sort();

  // Build data with all results as columns, normalized to 100
  const data = sortedDates.map((date) => {
    const row: Record<string, unknown> = { date };
    results.forEach((r, i) => {
      const point = r.equity_curve.find((p) => p.date.slice(0, 10) === date);
      if (point) {
        const startVal = r.equity_curve[0]?.strategy_value || 1;
        row[`r${i}`] = (point.strategy_value / startVal) * 100000;
      }
      // Add benchmark from first result only
      if (i === 0 && point) {
        const benchStart = r.equity_curve[0]?.benchmark_value || 1;
        row.benchmark = (point.benchmark_value / benchStart) * 100000;
      }
    });
    return row;
  });

  return (
    <div className="bt-section">
      <h4>Overlaid Equity Curves (Normalized to $100k)</h4>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis dataKey="date" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
          <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
          {results.map((r, i) => (
            <Line
              key={r.id}
              type="monotone"
              dataKey={`r${i}`}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={false}
              name={r.name}
            />
          ))}
          <Line type="monotone" dataKey="benchmark" stroke="#8b949e" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Benchmark" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
