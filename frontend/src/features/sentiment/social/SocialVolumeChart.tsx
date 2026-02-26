import { useEffect, useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSocialHistory } from '../../../api/sentimentApi';
import type { SocialMetrics } from '../types/sentiment.types';

interface Props {
  symbol: string;
}

export function SocialVolumeChart({ symbol }: Props) {
  const [data, setData] = useState<SocialMetrics[]>([]);

  useEffect(() => {
    getSocialHistory(symbol)
      .then(setData)
      .catch(() => {});
  }, [symbol]);

  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    mentions: d.mentionCount,
    sentiment: d.sentimentScore,
  }));

  return (
    <div style={{ marginTop: 12 }}>
      <div className="sent-text-sm sent-text-muted sent-mb-8">Volume + Sentiment (24h)</div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#8b949e' }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#8b949e' }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: '#8b949e' }} />
          <Tooltip
            contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: 12 }}
          />
          <Bar yAxisId="left" dataKey="mentions" fill="#30363d" opacity={0.6} />
          <Line yAxisId="right" type="monotone" dataKey="sentiment" stroke="#58a6ff" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
