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

interface TimingHistogramsProps {
  entryEfficiencies: number[];
  exitEfficiencies: number[];
}

function buildHistogram(values: number[], bins = 10) {
  const result: { range: string; count: number; center: number }[] = [];
  const step = 1 / bins;
  for (let i = 0; i < bins; i++) {
    const lo = i * step;
    const hi = (i + 1) * step;
    const count = values.filter((v) => v >= lo && (i === bins - 1 ? v <= hi : v < hi)).length;
    result.push({
      range: `${(lo * 100).toFixed(0)}%`,
      count,
      center: (lo + hi) / 2,
    });
  }
  return result;
}

function getBarColor(center: number): string {
  if (center >= 0.6) return '#3fb950';
  if (center >= 0.4) return '#d29922';
  return '#f85149';
}

export function TimingHistograms({ entryEfficiencies, exitEfficiencies }: TimingHistogramsProps) {
  const entryHist = buildHistogram(entryEfficiencies);
  const exitHist = buildHistogram(exitEfficiencies);

  return (
    <div className="tf-timing-histograms">
      <div className="tf-histogram">
        <h5>Entry Efficiency Distribution</h5>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={entryHist}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="range"
              stroke="#8b949e"
              tick={{ fill: '#8b949e', fontSize: 10 }}
            />
            <YAxis stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 8,
              }}
            />
            <Bar dataKey="count" name="Trades">
              {entryHist.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.center)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="tf-histogram">
        <h5>Exit Efficiency Distribution</h5>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={exitHist}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="range"
              stroke="#8b949e"
              tick={{ fill: '#8b949e', fontSize: 10 }}
            />
            <YAxis stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 8,
              }}
            />
            <Bar dataKey="count" name="Trades">
              {exitHist.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.center)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
