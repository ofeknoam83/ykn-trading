import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Position } from '../../../types/portfolio';

interface Props {
  positions: Position[];
}

interface SourcePnL {
  name: string;
  type: string;
  positions: number;
  invested: number;
  current_value: number;
  day_pnl: number;
  day_pnl_pct: number;
  total_pnl: number;
  total_pnl_pct: number;
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PnLAttribution({ positions }: Props) {
  const sourcePnL = useMemo(() => {
    const map = new Map<string, SourcePnL>();

    for (const pos of positions) {
      for (const attr of pos.attributions) {
        const existing = map.get(attr.source_id) ?? {
          name: attr.source_name,
          type: attr.source_type,
          positions: 0,
          invested: 0,
          current_value: 0,
          day_pnl: 0,
          day_pnl_pct: 0,
          total_pnl: 0,
          total_pnl_pct: 0,
        };
        existing.positions += 1;
        existing.invested += attr.quantity * attr.avg_cost;
        existing.current_value += attr.quantity * pos.current_price;
        existing.day_pnl += attr.pnl.amount * (pos.day_pnl.amount / (pos.total_pnl.amount || 1));
        existing.total_pnl += attr.pnl.amount;
        map.set(attr.source_id, existing);
      }
    }

    const result = Array.from(map.values());
    // Recalculate percentages
    for (const s of result) {
      s.day_pnl_pct = s.invested > 0 ? (s.day_pnl / s.invested) * 100 : 0;
      s.total_pnl_pct = s.invested > 0 ? (s.total_pnl / s.invested) * 100 : 0;
    }
    return result.sort((a, b) => b.day_pnl - a.day_pnl);
  }, [positions]);

  const chartData = sourcePnL.map((s) => ({
    name: s.name,
    pnl: s.day_pnl,
  }));

  const totalDayPnl = sourcePnL.reduce((sum, s) => sum + s.day_pnl, 0);

  return (
    <div className="poc-pnl-attribution">
      <h4 className="poc-panel-subtitle">P&L Attribution (Today)</h4>

      <div className="poc-pnl-chart">
        <ResponsiveContainer width="100%" height={Math.max(120, sourcePnL.length * 40)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 60 }}>
            <XAxis type="number" tick={{ fill: '#8b949e', fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#e6edf3', fontSize: 12 }}
              width={80}
            />
            <Tooltip
              contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3' }}
              formatter={(value) => [`$${formatMoney(Number(value))}`, 'P&L']}
            />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.pnl >= 0 ? '#238636' : '#da3633'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="poc-pnl-table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Type</th>
            <th className="poc-right">Positions</th>
            <th className="poc-right">Invested</th>
            <th className="poc-right">Current</th>
            <th className="poc-right">Day P&L</th>
            <th className="poc-right">Total P&L</th>
          </tr>
        </thead>
        <tbody>
          {sourcePnL.map((s) => (
            <tr key={s.name}>
              <td>{s.name}</td>
              <td>
                <span className={`poc-type-badge poc-type-${s.type}`}>
                  {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                </span>
              </td>
              <td className="poc-right">{s.positions}</td>
              <td className="poc-right poc-mono">${formatMoney(s.invested)}</td>
              <td className="poc-right poc-mono">${formatMoney(s.current_value)}</td>
              <td className={`poc-right poc-mono poc-pnl ${s.day_pnl >= 0 ? 'positive' : 'negative'}`}>
                {s.day_pnl >= 0 ? '+' : ''}${formatMoney(s.day_pnl)} ({s.day_pnl_pct >= 0 ? '+' : ''}{s.day_pnl_pct.toFixed(2)}%)
              </td>
              <td className={`poc-right poc-mono poc-pnl ${s.total_pnl >= 0 ? 'positive' : 'negative'}`}>
                {s.total_pnl >= 0 ? '+' : ''}${formatMoney(s.total_pnl)} ({s.total_pnl_pct >= 0 ? '+' : ''}{s.total_pnl_pct.toFixed(2)}%)
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="poc-pnl-total-row">
            <td colSpan={5}><strong>Total</strong></td>
            <td className={`poc-right poc-mono poc-pnl ${totalDayPnl >= 0 ? 'positive' : 'negative'}`}>
              <strong>{totalDayPnl >= 0 ? '+' : ''}${formatMoney(totalDayPnl)}</strong>
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
