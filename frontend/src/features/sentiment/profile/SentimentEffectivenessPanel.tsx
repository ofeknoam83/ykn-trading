import { useEffect, useState } from 'react';
import { getEffectivenessAnalysis } from '../../../api/sentimentApi';
import type { SentimentEffectiveness } from '../types/sentiment.types';

interface Props {
  symbol: string;
}

function stars(count: number): string {
  return '\u2605'.repeat(count) + '\u2606'.repeat(5 - count);
}

export function SentimentEffectivenessPanel({ symbol }: Props) {
  const [data, setData] = useState<SentimentEffectiveness | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEffectivenessAnalysis(symbol)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol]);

  if (loading) return <div className="sent-loading">Analyzing sentiment effectiveness...</div>;
  if (!data) return <div className="sent-empty">Effectiveness analysis not available for {symbol}</div>;

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Sentiment Effectiveness: {symbol} ({data.period})</span>
      </div>
      <div className="sent-card-body">
        <div style={{ marginBottom: 16 }}>
          {data.indicators.map((ind) => (
            <div key={ind.name} className="sent-eff-row">
              <span className="sent-eff-name">{ind.name}</span>
              <span className="sent-eff-stars">{stars(ind.stars)}</span>
              <span className="sent-eff-power">{ind.predictivePower.toFixed(2)}</span>
              <span className="sent-eff-timeframe">{ind.bestTimeframe}</span>
              <span className="sent-eff-lag">{ind.lag}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: 12, background: '#0d1117', borderRadius: 6 }}>
          <div className="sent-text-sm sent-font-bold sent-mb-8">Key Finding</div>
          <div style={{ fontSize: 12, color: '#e6edf3', marginBottom: 8 }}>{data.keyFinding}</div>
          <div className="sent-text-sm sent-font-bold sent-mb-8">Recommendation</div>
          <div style={{ fontSize: 12, color: '#e6edf3' }}>{data.recommendation}</div>
        </div>
      </div>
    </div>
  );
}
