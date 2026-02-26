import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';
import type { BacktestResult } from '../../../types/backtest';

interface DistributionTabProps {
  result: BacktestResult;
}

export function DistributionTab({ result }: DistributionTabProps) {
  const dist = result.return_distribution;
  if (!dist) {
    return <div className="bt-empty">Return distribution data not available</div>;
  }

  const histData = dist.histogram.map((b) => ({
    range: `${(b.bin_start * 100).toFixed(1)}%`,
    count: b.count,
    center: ((b.bin_start + b.bin_end) / 2) * 100,
  }));

  const qqData = dist.qq_theoretical.map((t, i) => ({
    theoretical: t,
    actual: dist.qq_actual[i],
  }));

  const metrics = result.metrics;
  const skewInterp = metrics.skewness < -0.5
    ? 'Negative skew — larger left tail, more extreme losses'
    : metrics.skewness > 0.5
    ? 'Positive skew — larger right tail, more extreme gains'
    : 'Approximately symmetric';

  const kurtInterp = metrics.kurtosis > 3.5
    ? 'Fat tails — more extreme events than normal distribution'
    : metrics.kurtosis < 2.5
    ? 'Thin tails — fewer extreme events than normal distribution'
    : 'Close to normal distribution';

  return (
    <div className="bt-distribution-tab">
      <div className="bt-section">
        <h4>Daily Return Distribution</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={histData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="range" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 9 }} />
            <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} />
            <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
            <Bar dataKey="count" name="Frequency">
              {histData.map((entry, i) => (
                <Cell key={i} fill={entry.center >= 0 ? '#3fb950' : '#f85149'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bt-section">
        <h4>Q-Q Plot (vs Normal)</h4>
        {qqData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis
                dataKey="theoretical"
                name="Theoretical"
                stroke="#8b949e"
                tick={{ fill: '#8b949e' }}
                label={{ value: 'Theoretical Quantiles', fill: '#8b949e', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                dataKey="actual"
                name="Actual"
                stroke="#8b949e"
                tick={{ fill: '#8b949e' }}
                label={{ value: 'Actual Quantiles', fill: '#8b949e', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
              <Scatter data={qqData} fill="#58a6ff" />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="bt-empty">Q-Q data not available</div>
        )}
      </div>

      <div className="bt-section bt-dist-stats">
        <h4>Distribution Statistics</h4>
        <div className="bt-stats-cards">
          <div className="bt-stat-card">
            <span className="bt-stat-label">Skewness</span>
            <span className="bt-stat-value mono">{metrics.skewness.toFixed(3)}</span>
            <span className="bt-stat-desc">{skewInterp}</span>
          </div>
          <div className="bt-stat-card">
            <span className="bt-stat-label">Kurtosis</span>
            <span className="bt-stat-value mono">{metrics.kurtosis.toFixed(3)}</span>
            <span className="bt-stat-desc">{kurtInterp}</span>
          </div>
        </div>
      </div>

      <div className="bt-section bt-best-worst">
        <div className="bt-bw-col">
          <h4>Best 10 Days</h4>
          <table className="bt-table bt-table-sm">
            <thead>
              <tr><th>Date</th><th>Return</th></tr>
            </thead>
            <tbody>
              {dist.best_days.slice(0, 10).map((d) => (
                <tr key={d.date}>
                  <td>{d.date.slice(0, 10)}</td>
                  <td className="mono bt-metric-positive">{(d.return_pct * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bt-bw-col">
          <h4>Worst 10 Days</h4>
          <table className="bt-table bt-table-sm">
            <thead>
              <tr><th>Date</th><th>Return</th></tr>
            </thead>
            <tbody>
              {dist.worst_days.slice(0, 10).map((d) => (
                <tr key={d.date}>
                  <td>{d.date.slice(0, 10)}</td>
                  <td className="mono bt-metric-negative">{(d.return_pct * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
