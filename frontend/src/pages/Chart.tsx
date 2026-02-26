import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHistorical, getQuote } from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Chart() {
  const { symbol } = useParams<{ symbol: string }>();
  const [data, setData] = useState<{ bucket: string; close: number }[]>([]);
  const [quote, setQuote] = useState<{ price: number; change_percent?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);

    Promise.all([
      getHistorical(symbol, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10), '1d'),
      getQuote(symbol).catch(() => ({})),
    ])
      .then(([hist, q]) => {
        const d = (hist.data || []).map((x: { bucket: string; close?: number; Close?: number }) => ({
          bucket: x.bucket,
          close: x.close ?? x.Close ?? 0,
        }));
        setData(d);
        setQuote(q?.price != null ? { price: q.price, change_percent: q.change_percent } : null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (!symbol) {
    return (
      <div className="chart-page">
        <p>No symbol provided.</p>
        <Link to="/">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="chart-page">
      <div className="chart-header">
        <Link to="/" className="back-link">← Dashboard</Link>
        <h2>{symbol}</h2>
        {quote && (
          <div className="chart-quote">
            <span className="price">${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            {quote.change_percent != null && (
              <span className={quote.change_percent >= 0 ? 'change-up' : 'change-down'}>
                {quote.change_percent >= 0 ? '+' : ''}{quote.change_percent.toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </div>

      {loading && <div className="chart-loading">Loading chart...</div>}
      {error && <div className="chart-error">{error}</div>}
      {!loading && !error && data.length > 0 && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="bucket" stroke="#8b949e" tick={{ fill: '#8b949e' }} />
              <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                labelStyle={{ color: '#e6edf3' }}
              />
              <Line type="monotone" dataKey="close" stroke="#58a6ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
