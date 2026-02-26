import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import type { TimeSeriesPoint, RegimeTag } from '../../../types/backtest';
import { REGIME_CONFIG } from '../../../types/backtest';

interface EquityCurveChartProps {
  data: TimeSeriesPoint[];
  height?: number;
  showBenchmark?: boolean;
  showDrawdown?: boolean;
  regimes?: RegimeTag[];
  windowBoundaries?: string[];
  additionalLines?: { key: string; color: string; label: string }[];
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
}

function formatDate(date: string) {
  return date.slice(0, 10);
}

export function EquityCurveChart({
  data,
  height = 400,
  showBenchmark = true,
  showDrawdown = false,
  regimes,
  windowBoundaries,
}: EquityCurveChartProps) {
  if (data.length === 0) {
    return <div className="bt-chart-empty">No equity curve data available</div>;
  }

  const chartData = data.map((p) => ({
    date: formatDate(p.date),
    strategy: p.strategy_value,
    benchmark: p.benchmark_value,
    drawdown: p.drawdown_pct * 100,
  }));

  // Build regime background reference areas
  const regimeAreas: { x1: string; x2: string; color: string }[] = [];
  if (regimes && regimes.length > 0) {
    let current = regimes[0];
    let start = current.date;
    for (let i = 1; i < regimes.length; i++) {
      if (regimes[i].regime !== current.regime) {
        regimeAreas.push({
          x1: formatDate(start),
          x2: formatDate(regimes[i].date),
          color: REGIME_CONFIG[current.regime].bgColor,
        });
        current = regimes[i];
        start = current.date;
      }
    }
    regimeAreas.push({
      x1: formatDate(start),
      x2: formatDate(regimes[regimes.length - 1].date),
      color: REGIME_CONFIG[current.regime].bgColor,
    });
  }

  if (showDrawdown) {
    return (
      <div className="bt-equity-chart">
        <ResponsiveContainer width="100%" height={height * 0.7}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="date" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
            <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} tickFormatter={formatCurrency} />
            <Tooltip
              contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
              labelStyle={{ color: '#8b949e' }}
            />
            <Line type="monotone" dataKey="strategy" stroke="#58a6ff" strokeWidth={2} dot={false} name="Strategy" />
            {showBenchmark && (
              <Line type="monotone" dataKey="benchmark" stroke="#8b949e" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Benchmark" />
            )}
            {windowBoundaries?.map((date) => (
              <ReferenceLine key={date} x={formatDate(date)} stroke="#30363d" strokeDasharray="3 3" />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={height * 0.3}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="date" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
            <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
            <Tooltip
              contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
              formatter={(value: number | string | undefined) => [`${Number(value ?? 0).toFixed(2)}%`, 'Drawdown']}
            />
            <Area type="monotone" dataKey="drawdown" stroke="#f85149" fill="rgba(248,81,73,0.2)" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bt-equity-chart">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis dataKey="date" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
          <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} tickFormatter={formatCurrency} />
          <Tooltip
            contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
            labelStyle={{ color: '#8b949e' }}
          />
          <Line type="monotone" dataKey="strategy" stroke="#58a6ff" strokeWidth={2} dot={false} name="Strategy" />
          {showBenchmark && (
            <Line type="monotone" dataKey="benchmark" stroke="#8b949e" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Benchmark" />
          )}
          {windowBoundaries?.map((date) => (
            <ReferenceLine key={date} x={formatDate(date)} stroke="#30363d" strokeDasharray="3 3" />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
