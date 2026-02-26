import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DistributionHistogramProps {
  values: number[];
  label: string;
  format?: 'pct' | 'number';
  inverted?: boolean;
}

export function DistributionHistogram({ values, label, format = 'pct', inverted }: DistributionHistogramProps) {
  if (values.length === 0) return null;

  const multiplier = format === 'pct' ? 100 : 1;
  const scaled = values.map((v) => v * multiplier);
  const min = Math.floor(Math.min(...scaled));
  const max = Math.ceil(Math.max(...scaled));
  const binCount = Math.min(30, Math.max(10, Math.ceil(Math.sqrt(scaled.length))));
  const binSize = (max - min) / binCount || 1;

  const bins: { range: string; count: number; center: number }[] = [];
  for (let i = 0; i < binCount; i++) {
    const lo = min + i * binSize;
    const hi = lo + binSize;
    const count = scaled.filter((v) => v >= lo && (i === binCount - 1 ? v <= hi : v < hi)).length;
    bins.push({
      range: `${lo.toFixed(0)}${format === 'pct' ? '%' : ''}`,
      count,
      center: (lo + hi) / 2,
    });
  }

  return (
    <div className="bt-section bt-mc-histogram">
      <h4>{label}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={bins}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis dataKey="range" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 9 }} />
          <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} />
          <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
          <Bar dataKey="count" name="Frequency">
            {bins.map((b, i) => (
              <Cell
                key={i}
                fill={inverted
                  ? (b.center <= 0 ? '#3fb950' : '#f85149')
                  : (b.center >= 0 ? '#3fb950' : '#f85149')
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
