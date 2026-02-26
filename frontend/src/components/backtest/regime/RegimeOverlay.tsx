import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import type { TimeSeriesPoint, RegimeTag } from '../../../types/backtest';
import { REGIME_CONFIG } from '../../../types/backtest';

interface RegimeOverlayProps {
  equityCurve: TimeSeriesPoint[];
  regimes: RegimeTag[];
}

export function RegimeOverlay({ equityCurve, regimes }: RegimeOverlayProps) {
  if (equityCurve.length === 0) return null;

  const data = equityCurve.map((p) => ({
    date: p.date.slice(0, 10),
    strategy: p.strategy_value,
    benchmark: p.benchmark_value,
  }));

  // Build regime spans
  const spans: { x1: string; x2: string; color: string; regime: string }[] = [];
  if (regimes.length > 0) {
    let start = regimes[0];
    for (let i = 1; i < regimes.length; i++) {
      if (regimes[i].regime !== start.regime) {
        spans.push({
          x1: start.date.slice(0, 10),
          x2: regimes[i].date.slice(0, 10),
          color: REGIME_CONFIG[start.regime].bgColor,
          regime: REGIME_CONFIG[start.regime].label,
        });
        start = regimes[i];
      }
    }
    spans.push({
      x1: start.date.slice(0, 10),
      x2: regimes[regimes.length - 1].date.slice(0, 10),
      color: REGIME_CONFIG[start.regime].bgColor,
      regime: REGIME_CONFIG[start.regime].label,
    });
  }

  return (
    <div className="bt-section">
      <h4>Equity Curve with Regime Overlay</h4>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          {spans.map((s, i) => (
            <ReferenceArea key={i} x1={s.x1} x2={s.x2} fill={s.color} fillOpacity={0.3} />
          ))}
          <XAxis dataKey="date" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
          <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
          <Line type="monotone" dataKey="strategy" stroke="#58a6ff" strokeWidth={2} dot={false} name="Strategy" />
          <Line type="monotone" dataKey="benchmark" stroke="#8b949e" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Benchmark" />
        </LineChart>
      </ResponsiveContainer>
      <div className="bt-regime-legend">
        {Object.entries(REGIME_CONFIG).map(([key, cfg]) => (
          <span key={key} className="bt-regime-legend-item">
            <span className="bt-regime-dot" style={{ background: cfg.color }} />
            {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
