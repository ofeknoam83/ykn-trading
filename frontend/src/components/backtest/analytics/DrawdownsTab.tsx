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

interface DrawdownsTabProps {
  result: BacktestResult;
}

export function DrawdownsTab({ result }: DrawdownsTabProps) {
  const ddData = result.drawdown_series.map((d) => ({
    date: d.date.slice(0, 10),
    drawdown: d.drawdown_pct * 100,
    underwater: d.underwater_days,
  }));

  return (
    <div className="bt-drawdowns-tab">
      <div className="bt-section">
        <h4>Drawdown Over Time</h4>
        {ddData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ddData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="date" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
              <YAxis
                stroke="#8b949e"
                tick={{ fill: '#8b949e' }}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
                reversed
              />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                formatter={((v: number) => [`${v.toFixed(2)}%`, 'Drawdown']) as never}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#f85149"
                fill="rgba(248,81,73,0.3)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="bt-empty">No drawdown data</div>
        )}
      </div>

      <div className="bt-section">
        <h4>Top Drawdown Periods</h4>
        {result.top_drawdowns.length > 0 ? (
          <table className="bt-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Start</th>
                <th>Bottom</th>
                <th>Recovery</th>
                <th>Depth</th>
                <th>Duration</th>
                <th>Recovery Time</th>
              </tr>
            </thead>
            <tbody>
              {result.top_drawdowns.map((dd, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{dd.start_date.slice(0, 10)}</td>
                  <td>{dd.bottom_date.slice(0, 10)}</td>
                  <td>{dd.recovery_date ? dd.recovery_date.slice(0, 10) : 'Ongoing'}</td>
                  <td className="bt-metric-negative mono">{(dd.depth_pct * 100).toFixed(2)}%</td>
                  <td>{dd.duration_days}d</td>
                  <td>{dd.recovery_days != null ? `${dd.recovery_days}d` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="bt-empty">No significant drawdown periods</div>
        )}
      </div>

      {ddData.length > 0 && (
        <div className="bt-section">
          <h4>Days Underwater</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ddData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="date" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
              <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} label={{ value: 'Days', fill: '#8b949e', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                formatter={((v: number) => [`${v} days`, 'Underwater']) as never}
              />
              <Area type="monotone" dataKey="underwater" stroke="#d29922" fill="rgba(210,153,34,0.2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
