import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getNewsSentimentSeries } from '../../../api/sentimentApi';
import type { NewsSentimentSeries } from '../types/sentiment.types';

interface Props {
  symbol?: string;
}

export function NewsSentimentChart({ symbol }: Props) {
  const [data, setData] = useState<NewsSentimentSeries[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    getNewsSentimentSeries(symbol)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol]);

  if (!symbol) return null;
  if (loading) return <div className="sent-loading" style={{ height: 200 }}>Loading chart...</div>;
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    score: d.score,
    articles: d.articleCount,
  }));

  return (
    <div style={{ padding: '12px 16px' }}>
      <div className="sent-text-sm sent-text-muted sent-mb-8">News Sentiment Over Time</div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#8b949e' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8b949e' }} />
          <Tooltip
            contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }}
            labelStyle={{ color: '#8b949e' }}
          />
          <ReferenceLine y={50} stroke="#30363d" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="score" stroke="#58a6ff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
