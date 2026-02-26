import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
} from 'recharts';
import type { TradeRecord } from '../../../types/backtest';
import type { EnrichedTradeRecord } from '../../../types/forensics';

interface ReplayChartProps {
  trade: TradeRecord;
  enrichedTrade: EnrichedTradeRecord | null;
  playbackIndex: number | null;
}

interface ChartBar {
  date: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  range: [number, number]; // [low, high] for bar chart
  bodyRange: [number, number]; // [open, close] for body
  isGreen: boolean;
  indicators: Record<string, number>;
}

export function ReplayChart({ trade, enrichedTrade, playbackIndex }: ReplayChartProps) {
  const chartData: ChartBar[] = useMemo(() => {
    if (!enrichedTrade?.chart_data) return [];

    const data = enrichedTrade.chart_data;
    const visibleData =
      playbackIndex !== null ? data.slice(0, playbackIndex + 1) : data;

    return visibleData.map((d) => ({
      date: d.date.slice(0, 10),
      o: d.o,
      h: d.h,
      l: d.l,
      c: d.c,
      v: d.v,
      range: [d.l, d.h],
      bodyRange: [Math.min(d.o, d.c), Math.max(d.o, d.c)],
      isGreen: d.c >= d.o,
      indicators: d.indicators,
    }));
  }, [enrichedTrade, playbackIndex]);

  // Get indicator names from chart data
  const indicatorNames = useMemo(() => {
    if (chartData.length === 0) return [];
    return Object.keys(chartData[0].indicators);
  }, [chartData]);

  // Separate price overlays (SMA, BB) from sub-chart indicators (RSI, MACD)
  const priceOverlays = useMemo(
    () =>
      indicatorNames.filter(
        (n) =>
          n.toLowerCase().includes('sma') ||
          n.toLowerCase().includes('ema') ||
          n.toLowerCase().includes('bb') ||
          n.toLowerCase().includes('bollinger')
      ),
    [indicatorNames]
  );

  const subIndicators = useMemo(
    () => indicatorNames.filter((n) => !priceOverlays.includes(n)),
    [indicatorNames, priceOverlays]
  );

  const OVERLAY_COLORS = ['#58a6ff', '#f0883e', '#d2a8ff', '#3fb950', '#f778ba'];

  if (chartData.length === 0) {
    return (
      <div className="tf-chart-container">
        <div className="tf-empty-state">
          {enrichedTrade
            ? 'No chart data available for this trade.'
            : 'Loading chart data...'}
        </div>
      </div>
    );
  }

  const entryDate = trade.entry_date.slice(0, 10);
  const exitDate = trade.exit_date.slice(0, 10);
  const isWinner = trade.pnl >= 0;

  return (
    <div className="tf-chart-container">
      {/* Price Chart */}
      <div className="tf-chart-section">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="date"
              stroke="#8b949e"
              tick={{ fill: '#8b949e', fontSize: 10 }}
              interval={Math.max(0, Math.floor(chartData.length / 10))}
            />
            <YAxis
              stroke="#8b949e"
              tick={{ fill: '#8b949e', fontSize: 10 }}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={((value: unknown, name: string) => {
                if (typeof value === 'number') return [`$${value.toFixed(2)}`, name];
                return [String(value), name];
              }) as never}
            />

            {/* Trade period shading */}
            <ReferenceArea
              x1={entryDate}
              x2={exitDate}
              fill={isWinner ? '#3fb950' : '#f85149'}
              fillOpacity={0.08}
            />

            {/* Entry/Exit markers */}
            <ReferenceLine
              x={entryDate}
              stroke="#3fb950"
              strokeDasharray="5 3"
              label={{ value: 'Entry', fill: '#3fb950', fontSize: 10, position: 'top' }}
            />
            <ReferenceLine
              x={exitDate}
              stroke={isWinner ? '#3fb950' : '#f85149'}
              strokeDasharray="5 3"
              label={{ value: 'Exit', fill: isWinner ? '#3fb950' : '#f85149', fontSize: 10, position: 'top' }}
            />

            {/* High-Low wicks as thin bars */}
            <Bar dataKey="range" barSize={1} fill="#8b949e" isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`wick-${index}`}
                  fill={entry.isGreen ? '#3fb950' : '#f85149'}
                />
              ))}
            </Bar>

            {/* Body bars */}
            <Bar dataKey="bodyRange" barSize={6} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`body-${index}`}
                  fill={entry.isGreen ? '#3fb950' : '#f85149'}
                />
              ))}
            </Bar>

            {/* Price overlay indicators */}
            {priceOverlays.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={(d: ChartBar) => d.indicators[name]}
                name={name}
                stroke={OVERLAY_COLORS[i % OVERLAY_COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Sub-Chart */}
      <div className="tf-chart-section tf-chart-volume">
        <ResponsiveContainer width="100%" height={80}>
          <ComposedChart data={chartData} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis
              stroke="#8b949e"
              tick={{ fill: '#8b949e', fontSize: 9 }}
              width={50}
              tickFormatter={(v: number) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`
              }
            />
            <Bar dataKey="v" name="Volume" isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`vol-${index}`}
                  fill={entry.isGreen ? 'rgba(63,185,80,0.4)' : 'rgba(248,81,73,0.4)'}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-chart indicators (RSI, MACD, etc.) */}
      {subIndicators.map((name) => (
        <div key={name} className="tf-chart-section tf-chart-sub">
          <div className="tf-chart-sub-label">{name}</div>
          <ResponsiveContainer width="100%" height={80}>
            <ComposedChart data={chartData} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis
                stroke="#8b949e"
                tick={{ fill: '#8b949e', fontSize: 9 }}
                width={50}
                domain={name.toLowerCase().includes('rsi') ? [0, 100] : ['auto', 'auto']}
              />
              {name.toLowerCase().includes('rsi') && (
                <>
                  <ReferenceLine y={70} stroke="#f85149" strokeDasharray="3 3" strokeWidth={0.5} />
                  <ReferenceLine y={30} stroke="#3fb950" strokeDasharray="3 3" strokeWidth={0.5} />
                </>
              )}
              <Line
                type="monotone"
                dataKey={(d: ChartBar) => d.indicators[name]}
                name={name}
                stroke="#58a6ff"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ))}

      {/* Overlay legend */}
      {priceOverlays.length > 0 && (
        <div className="tf-chart-legend">
          {priceOverlays.map((name, i) => (
            <span key={name} className="tf-legend-item">
              <span
                className="tf-legend-swatch"
                style={{ backgroundColor: OVERLAY_COLORS[i % OVERLAY_COLORS.length] }}
              />
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
