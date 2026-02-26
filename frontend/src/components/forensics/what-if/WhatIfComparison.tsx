import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TradeRecord } from '../../../types/backtest';
import type { WhatIfResult } from '../../../types/forensics';
import { VerdictBadge } from '../shared/VerdictBadge';

interface WhatIfComparisonProps {
  trade: TradeRecord;
  result: WhatIfResult | null;
  simulating: boolean;
}

export function WhatIfComparison({ result, simulating }: WhatIfComparisonProps) {
  if (simulating) {
    return (
      <div className="tf-comparison">
        <div className="tf-loading">Running simulation...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="tf-comparison">
        <div className="tf-empty-state">
          Adjust parameters and click "Simulate" to see what-if results.
        </div>
      </div>
    );
  }

  const { original, modified, comparison } = result;

  // Merge equity curves for overlay chart
  const curveMap = new Map<string, { date: string; original?: number; whatif?: number }>();
  for (const pt of original.equity_curve) {
    curveMap.set(pt.date, { date: pt.date.slice(0, 10), original: pt.value });
  }
  for (const pt of modified.equity_curve) {
    const existing = curveMap.get(pt.date);
    if (existing) {
      existing.whatif = pt.value;
    } else {
      curveMap.set(pt.date, { date: pt.date.slice(0, 10), whatif: pt.value });
    }
  }
  const chartData = Array.from(curveMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="tf-comparison">
      {/* Overlaid chart */}
      <div className="tf-comparison-chart">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="date"
              stroke="#8b949e"
              tick={{ fill: '#8b949e', fontSize: 10 }}
              interval={Math.max(0, Math.floor(chartData.length / 8))}
            />
            <YAxis
              stroke="#8b949e"
              tick={{ fill: '#8b949e', fontSize: 10 }}
              tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={((value: number, name: string) => [
                `$${value.toFixed(2)}`,
                name === 'original' ? 'Original' : 'What-If',
              ]) as never}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="original"
              name="Original"
              stroke="#58a6ff"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="whatif"
              name="What-If"
              stroke="#f0883e"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Outcome comparison table */}
      <div className="tf-comparison-table">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Original</th>
              <th>What-If</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="tf-detail-label">Entry</td>
              <td className="mono">{original.entry_date.slice(0, 10)}</td>
              <td className="mono">{modified.entry_date.slice(0, 10)}</td>
              <td></td>
            </tr>
            <tr>
              <td className="tf-detail-label">Exit</td>
              <td className="mono">{original.exit_date.slice(0, 10)}</td>
              <td className="mono">{modified.exit_date.slice(0, 10)}</td>
              <td></td>
            </tr>
            <tr>
              <td className="tf-detail-label">Exit Reason</td>
              <td>{original.exit_reason}</td>
              <td>{modified.exit_reason}</td>
              <td></td>
            </tr>
            <tr>
              <td className="tf-detail-label">Duration</td>
              <td>{original.duration_days}d</td>
              <td>{modified.duration_days}d</td>
              <td className="mono">
                {modified.duration_days - original.duration_days > 0 ? '+' : ''}
                {modified.duration_days - original.duration_days}d
              </td>
            </tr>
            <tr>
              <td className="tf-detail-label">P&L</td>
              <td className={`mono ${original.pnl >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                ${original.pnl.toFixed(2)}
              </td>
              <td className={`mono ${modified.pnl >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                ${modified.pnl.toFixed(2)}
              </td>
              <td className={`mono ${comparison.pnl_delta >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                {comparison.pnl_delta >= 0 ? '+' : ''}${comparison.pnl_delta.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="tf-detail-label">P&L %</td>
              <td className={`mono ${original.pnl_pct >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                {(original.pnl_pct * 100).toFixed(2)}%
              </td>
              <td className={`mono ${modified.pnl_pct >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                {(modified.pnl_pct * 100).toFixed(2)}%
              </td>
              <td className={`mono ${comparison.pnl_pct_delta >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                {comparison.pnl_pct_delta >= 0 ? '+' : ''}
                {(comparison.pnl_pct_delta * 100).toFixed(2)}%
              </td>
            </tr>
            <tr>
              <td className="tf-detail-label">Max Drawdown</td>
              <td className="mono">{(original.max_drawdown_pct * 100).toFixed(1)}%</td>
              <td className="mono">{(modified.max_drawdown_pct * 100).toFixed(1)}%</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div className="tf-verdict">
          <VerdictBadge
            verdict={comparison.verdict}
            delta={comparison.pnl_delta}
            label={
              comparison.verdict === 'better'
                ? `What-if is better by +$${Math.abs(comparison.pnl_delta).toFixed(0)}`
                : comparison.verdict === 'worse'
                  ? `What-if is worse by -$${Math.abs(comparison.pnl_delta).toFixed(0)}`
                  : 'Results are similar'
            }
          />
        </div>
      </div>
    </div>
  );
}
