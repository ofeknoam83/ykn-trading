import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { TimeSeriesPoint } from '../../../types/backtest';
import type { SignalEvent, SignalOutcome } from '../../../types/forensics';

interface SignalMiniChartProps {
  signals: SignalEvent[];
  equityCurve: TimeSeriesPoint[];
  selectedTradeId: string | null;
}

const OUTCOME_COLORS: Record<SignalOutcome, string> = {
  executed: '#3fb950',
  filtered: '#58a6ff',
  weak: '#8b949e',
  conflicted: '#d29922',
};

interface MiniChartPoint {
  date: string;
  value: number;
  signal?: SignalEvent;
  dotColor?: string;
}

export function SignalMiniChart({ signals, equityCurve, selectedTradeId }: SignalMiniChartProps) {
  // Map equity curve with signal dots
  const signalsByDate = new Map<string, SignalEvent>();
  for (const s of signals) {
    const date = s.timestamp.slice(0, 10);
    // If multiple signals on same day, prefer executed ones
    const existing = signalsByDate.get(date);
    if (!existing || s.outcome === 'executed') {
      signalsByDate.set(date, s);
    }
  }

  const chartData: MiniChartPoint[] = equityCurve.map((pt) => {
    const date = pt.date.slice(0, 10);
    const signal = signalsByDate.get(date);
    return {
      date,
      value: pt.strategy_value,
      signal,
      dotColor: signal ? OUTCOME_COLORS[signal.outcome] : undefined,
    };
  });

  // Find selected trade signals for highlighting
  const selectedSignals = signals.filter((s) => s.trade_id === selectedTradeId);
  const selectedDates = new Set(selectedSignals.map((s) => s.timestamp.slice(0, 10)));

  return (
    <div className="tf-mini-chart">
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              fontSize: 11,
            }}
            formatter={((value: number) => [`$${value.toFixed(2)}`, 'Value']) as never}
            labelFormatter={((label: string) => {
              const pt = chartData.find((d) => d.date === label);
              if (pt?.signal) {
                return `${label} — ${pt.signal.outcome.toUpperCase()} ${pt.signal.direction} ${pt.signal.symbol}`;
              }
              return label;
            }) as never}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#58a6ff"
            strokeWidth={1.5}
            dot={(props: { cx?: number; cy?: number; payload?: MiniChartPoint; index?: number }) => {
              const { cx = 0, cy = 0, payload } = props;
              if (!payload?.signal) return <g key={`dot-${payload?.date}`} />;
              const isSelected = selectedDates.has(payload.date);
              const radius = isSelected ? 5 : 3;
              return (
                <circle
                  key={`dot-${payload.date}`}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={payload.dotColor ?? '#8b949e'}
                  stroke={isSelected ? '#fff' : 'none'}
                  strokeWidth={isSelected ? 2 : 0}
                />
              );
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="tf-mini-chart-legend">
        <span className="tf-legend-item">
          <span className="tf-legend-dot" style={{ backgroundColor: '#3fb950' }} /> Executed
        </span>
        <span className="tf-legend-item">
          <span className="tf-legend-dot" style={{ backgroundColor: '#58a6ff' }} /> Filtered
        </span>
        <span className="tf-legend-item">
          <span className="tf-legend-dot" style={{ backgroundColor: '#8b949e' }} /> Weak
        </span>
        <span className="tf-legend-item">
          <span className="tf-legend-dot" style={{ backgroundColor: '#d29922' }} /> Conflicted
        </span>
      </div>
    </div>
  );
}
