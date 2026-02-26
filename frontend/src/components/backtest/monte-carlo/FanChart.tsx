import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import type { MonteCarloResult } from '../../../types/backtest';

interface FanChartProps {
  result: MonteCarloResult;
}

export function FanChart({ result }: FanChartProps) {
  const curves = result.percentile_curves;
  if (curves.length === 0) return null;

  // Find percentile curves by value
  const findCurve = (p: number) => curves.find((c) => c.percentile === p)?.values ?? [];
  const p2_5 = findCurve(2.5);
  const p10 = findCurve(10);
  const p25 = findCurve(25);
  const p50 = findCurve(50);
  const p75 = findCurve(75);
  const p90 = findCurve(90);
  const p97_5 = findCurve(97.5);

  const len = Math.max(p50.length, 1);
  const data = Array.from({ length: len }, (_, i) => ({
    idx: i,
    p2_5: p2_5[i] ?? 0,
    p10: p10[i] ?? 0,
    p25: p25[i] ?? 0,
    p50: p50[i] ?? 0,
    p75: p75[i] ?? 0,
    p90: p90[i] ?? 0,
    p97_5: p97_5[i] ?? 0,
  }));

  return (
    <div className="bt-section">
      <h4>Simulation Fan Chart</h4>
      <p className="bt-section-desc">
        Confidence intervals from {result.simulations.toLocaleString()} simulations
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis dataKey="idx" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
          <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
          <Area type="monotone" dataKey="p97_5" stroke="none" fill="rgba(88,166,255,0.08)" name="97.5th" />
          <Area type="monotone" dataKey="p90" stroke="none" fill="rgba(88,166,255,0.12)" name="90th" />
          <Area type="monotone" dataKey="p75" stroke="none" fill="rgba(88,166,255,0.18)" name="75th" />
          <Area type="monotone" dataKey="p25" stroke="none" fill="rgba(88,166,255,0.18)" name="25th" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="rgba(88,166,255,0.12)" name="10th" />
          <Area type="monotone" dataKey="p2_5" stroke="none" fill="rgba(88,166,255,0.08)" name="2.5th" />
          <Line type="monotone" dataKey="p50" stroke="#58a6ff" strokeWidth={2} dot={false} name="Median" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
