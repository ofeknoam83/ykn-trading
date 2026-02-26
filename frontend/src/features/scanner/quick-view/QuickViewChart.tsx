import { useState } from 'react';
import { SparklineCell } from '../results/SparklineCell';

interface QuickViewChartProps {
  symbol: string;
  sparklineData: number[];
}

const TIMERANGE_OPTIONS = ['1D', '1W', '1M', '3M', '6M', '1Y'] as const;

export function QuickViewChart({ symbol, sparklineData }: QuickViewChartProps) {
  const [range, setRange] = useState<typeof TIMERANGE_OPTIONS[number]>('6M');

  return (
    <div>
      <div className="sc-chart-placeholder">
        {/* In a full implementation, this would use Lightweight Charts (TradingView) */}
        {/* For now, show an expanded sparkline as placeholder */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <SparklineCell data={sparklineData} width={340} height={200} />
          <span style={{ fontSize: 12, color: '#8b949e' }}>
            {symbol} &bull; {range} chart
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'center' }}>
        {TIMERANGE_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setRange(opt)}
            style={{
              padding: '3px 8px',
              fontSize: 11,
              background: range === opt ? '#21262d' : 'transparent',
              border: '1px solid ' + (range === opt ? '#58a6ff' : '#30363d'),
              borderRadius: 4,
              color: range === opt ? '#e6edf3' : '#8b949e',
              cursor: 'pointer',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
