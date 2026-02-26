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
import type { BacktestResult } from '../../../types/backtest';

interface RollingTabProps {
  result: BacktestResult;
}

export function RollingTab({ result }: RollingTabProps) {
  const rolling = result.rolling_metrics;
  if (!rolling || rolling.points.length === 0) {
    return <div className="bt-empty">Rolling metrics not available</div>;
  }

  const data = rolling.points.map((p) => ({
    date: p.date.slice(0, 10),
    sharpe: p.sharpe,
    returnAnn: p.return_annualized * 100,
    vol: p.volatility_annualized * 100,
    beta: p.beta,
  }));

  const chartProps = {
    stroke: '#8b949e',
    tick: { fill: '#8b949e', fontSize: 10 } as const,
  };
  const tooltipStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 8 };

  return (
    <div className="bt-rolling-tab">
      <p className="bt-rolling-info">Rolling {rolling.window_days}-day window metrics</p>

      <div className="bt-section">
        <h4>Rolling Sharpe Ratio</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="date" {...chartProps} />
            <YAxis {...chartProps} />
            <Tooltip contentStyle={tooltipStyle} formatter={((v: number) => [v.toFixed(2), 'Sharpe']) as never} />
            <ReferenceLine y={0} stroke="#30363d" />
            <ReferenceLine y={1} stroke="#3fb95044" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="sharpe" stroke="#58a6ff" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bt-section">
        <h4>Rolling Annualized Return</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="date" {...chartProps} />
            <YAxis {...chartProps} tickFormatter={(v) => `${v.toFixed(0)}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={((v: number) => [`${v.toFixed(2)}%`, 'Return']) as never} />
            <ReferenceLine y={0} stroke="#30363d" />
            <Line type="monotone" dataKey="returnAnn" stroke="#3fb950" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bt-section">
        <h4>Rolling Volatility</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="date" {...chartProps} />
            <YAxis {...chartProps} tickFormatter={(v) => `${v.toFixed(0)}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={((v: number) => [`${v.toFixed(2)}%`, 'Volatility']) as never} />
            <Line type="monotone" dataKey="vol" stroke="#d29922" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bt-section">
        <h4>Rolling Beta</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="date" {...chartProps} />
            <YAxis {...chartProps} />
            <Tooltip contentStyle={tooltipStyle} formatter={((v: number) => [v.toFixed(2), 'Beta']) as never} />
            <ReferenceLine y={1} stroke="#8b949e" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="beta" stroke="#6e40c9" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
