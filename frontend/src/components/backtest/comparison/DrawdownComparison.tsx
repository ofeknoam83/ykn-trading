import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { BacktestResult } from '../../../types/backtest';

interface DrawdownComparisonProps {
  results: BacktestResult[];
  colors: string[];
}

export function DrawdownComparison({ results, colors }: DrawdownComparisonProps) {
  // Merge all drawdown series by date
  const allDates = new Set<string>();
  results.forEach((r) => r.drawdown_series.forEach((d) => allDates.add(d.date.slice(0, 10))));
  const sortedDates = [...allDates].sort();

  const data = sortedDates.map((date) => {
    const row: Record<string, unknown> = { date };
    results.forEach((r, i) => {
      const point = r.drawdown_series.find((d) => d.date.slice(0, 10) === date);
      row[`dd${i}`] = point ? point.drawdown_pct * 100 : 0;
    });
    return row;
  });

  return (
    <div className="bt-section">
      <h4>Drawdown Comparison</h4>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis dataKey="date" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
          <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} tickFormatter={(v) => `${v.toFixed(0)}%`} reversed />
          <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
          {results.map((r, i) => (
            <Area
              key={r.id}
              type="monotone"
              dataKey={`dd${i}`}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.15}
              dot={false}
              name={r.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <table className="bt-table bt-dd-summary">
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Max DD</th>
            <th>Max DD Duration</th>
            <th>Avg DD</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => {
            const avgDd = r.drawdown_series.length > 0
              ? r.drawdown_series.reduce((s, d) => s + d.drawdown_pct, 0) / r.drawdown_series.length
              : 0;
            return (
              <tr key={r.id}>
                <td>
                  <span className="bt-comp-dot" style={{ background: colors[i % colors.length] }} />
                  {r.name}
                </td>
                <td className="mono bt-metric-negative">{(r.metrics.max_drawdown * 100).toFixed(2)}%</td>
                <td className="mono">{r.metrics.max_drawdown_duration_days}d</td>
                <td className="mono bt-metric-negative">{(avgDd * 100).toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
