import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPnLHistory } from '../../../api/portfolioApi';

const COLORS = ['#58a6ff', '#238636', '#da3633', '#d29922', '#a371f7', '#f778ba'];
const RANGES = ['1D', '1W', '1M', '3M', 'All'];

interface PnLPoint {
  date: string;
  [source: string]: number | string;
}

export function PnLTimeSeries() {
  const [range, setRange] = useState('1M');
  const [data, setData] = useState<PnLPoint[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [hiddenSources, setHiddenSources] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPnLHistory({ group_by: 'source', range: range.toLowerCase() })
      .then((res) => {
        setData(res.data || []);
        setSources(res.sources || []);
      })
      .catch(() => {
        setData([]);
        setSources([]);
      })
      .finally(() => setLoading(false));
  }, [range]);

  function toggleSource(source: string) {
    setHiddenSources((prev) => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  }

  return (
    <div className="poc-pnl-timeseries">
      <div className="poc-pnl-ts-header">
        <h4 className="poc-panel-subtitle">Cumulative P&L</h4>
        <div className="poc-range-pills">
          {RANGES.map((r) => (
            <button
              key={r}
              className={`poc-range-pill ${range === r ? 'active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="poc-chart-loading">Loading...</div>
      ) : data.length === 0 ? (
        <div className="poc-chart-empty">No P&L history available</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3' }}
            />
            <Legend onClick={(e) => toggleSource(String(e.dataKey))} />
            {sources
              .filter((s) => !hiddenSources.has(s))
              .map((source, i) => (
                <Line
                  key={source}
                  type="monotone"
                  dataKey={source}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
