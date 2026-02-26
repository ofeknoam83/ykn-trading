import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getNewsSentimentSeries } from '../../../api/sentimentApi';
import type { NewsSentimentSeries } from '../types/sentiment.types';

interface Props {
  symbol: string;
}

export function SentimentChart({ symbol }: Props) {
  const [data, setData] = useState<NewsSentimentSeries[]>([]);
  const [range, setRange] = useState<'1D' | '5D' | '1M' | '3M'>('1M');

  useEffect(() => {
    getNewsSentimentSeries(symbol, range === '1D' ? '5m' : range === '5D' ? '1h' : '1d')
      .then(setData)
      .catch(() => {});
  }, [symbol, range]);

  const chartData = data.map((d) => ({
    time: range === '1D'
      ? new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: d.score,
    articles: d.articleCount,
  }));

  return (
    <div className="sent-card sent-mb-16">
      <div className="sent-card-header">
        <span className="sent-card-title">Sentiment History: {symbol}</span>
        <div className="sent-flex sent-gap-8">
          {(['1D', '5D', '1M', '3M'] as const).map((r) => (
            <button
              key={r}
              className={`sent-nav-btn ${range === r ? 'sent-nav-btn--active' : ''}`}
              onClick={() => setRange(r)}
              style={{ padding: '2px 8px', fontSize: 11 }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="sent-card-body">
        {chartData.length === 0 ? (
          <div className="sent-empty" style={{ height: 200 }}>No historical data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#8b949e' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8b949e' }} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }}
              />
              <ReferenceLine y={70} stroke="#3fb95040" strokeDasharray="3 3" label={{ value: '70', fill: '#3fb950', fontSize: 10 }} />
              <ReferenceLine y={30} stroke="#f8514940" strokeDasharray="3 3" label={{ value: '30', fill: '#f85149', fontSize: 10 }} />
              <ReferenceLine y={50} stroke="#30363d" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="score" stroke="#58a6ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
