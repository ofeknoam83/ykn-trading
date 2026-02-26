import { useEffect, useState } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { NewsCard } from './NewsCard';
import { ImpactAnalysisPanel } from './ImpactAnalysisPanel';
import { NewsSentimentChart } from './NewsSentimentChart';
import { getNewsSentimentFeed } from '../../../api/sentimentApi';
import type { NewsFeedFilters } from '../types/sentiment.types';

const TOPIC_OPTIONS = ['All', 'earnings', 'M&A', 'regulatory', 'product', 'macro', 'analyst', 'insider', 'ESG'];
const SENTIMENT_OPTIONS = ['All', 'positive', 'negative', 'neutral'];

interface Props {
  maxItems?: number;
  symbol?: string;
  standalone?: boolean;
}

export function NewsFeed({ maxItems, symbol, standalone }: Props) {
  const newsFeed = useSentimentStore((s) => s.newsFeed);
  const setNewsFeed = useSentimentStore((s) => s.setNewsFeed);
  const newsFeedLoading = useSentimentStore((s) => s.newsFeedLoading);
  const setNewsFeedLoading = useSentimentStore((s) => s.setNewsFeedLoading);
  const [filters, setFilters] = useState<NewsFeedFilters>(symbol ? { symbol } : {});
  const [impactArticleId, setImpactArticleId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setNewsFeedLoading(true);
    getNewsSentimentFeed(filters)
      .then((data) => { if (!cancelled) setNewsFeed(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setNewsFeedLoading(false); });
    return () => { cancelled = true; };
  }, [filters, setNewsFeed, setNewsFeedLoading]);

  const articles = maxItems ? newsFeed.slice(0, maxItems) : newsFeed;

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">News Feed{symbol ? `: ${symbol}` : ''}</span>
        {standalone && (
          <div className="sent-flex sent-gap-8">
            <select
              style={{ fontSize: 11, background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3', borderRadius: 4, padding: '2px 6px' }}
              value={filters.topic || 'All'}
              onChange={(e) => setFilters((f) => ({ ...f, topic: e.target.value === 'All' ? undefined : e.target.value }))}
            >
              {TOPIC_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              style={{ fontSize: 11, background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3', borderRadius: 4, padding: '2px 6px' }}
              value={filters.sentiment || 'All'}
              onChange={(e) => setFilters((f) => ({ ...f, sentiment: e.target.value === 'All' ? undefined : e.target.value as NewsFeedFilters['sentiment'] }))}
            >
              {SENTIMENT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      {standalone && <NewsSentimentChart symbol={symbol} />}

      <div style={{ maxHeight: standalone ? undefined : 400, overflowY: standalone ? undefined : 'auto' }}>
        {newsFeedLoading ? (
          <div className="sent-loading">Loading news...</div>
        ) : articles.length === 0 ? (
          <div className="sent-empty">No recent news coverage</div>
        ) : (
          articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onImpactAnalysis={setImpactArticleId}
            />
          ))
        )}
      </div>

      {impactArticleId && (
        <ImpactAnalysisPanel articleId={impactArticleId} onClose={() => setImpactArticleId(null)} />
      )}

      {maxItems && newsFeed.length > maxItems && (
        <div className="sent-card-footer">
          <button className="sent-link" onClick={() => useSentimentStore.getState().setActiveView('news')}>
            View Full Feed &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
