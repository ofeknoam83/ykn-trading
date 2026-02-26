import { rawSentimentColor, sentimentIndicator } from '../utils/sentimentColorScale';
import { EntitySentimentBadge } from './EntitySentimentBadge';
import type { NewsArticle } from '../types/sentiment.types';

interface Props {
  article: NewsArticle;
  onImpactAnalysis?: (articleId: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NewsCard({ article, onImpactAnalysis }: Props) {
  const primaryEntity = article.entities.find((e) => e.relevance === 'primary') || article.entities[0];
  const avgSentiment = article.entities.length > 0
    ? article.entities.reduce((sum, e) => sum + e.sentiment, 0) / article.entities.length
    : 0;

  return (
    <div className="sent-news-item">
      <div className="sent-news-header">
        <span className="sent-news-score" style={{ color: rawSentimentColor(avgSentiment) }}>
          {sentimentIndicator(avgSentiment)} {avgSentiment >= 0 ? '+' : ''}{avgSentiment.toFixed(1)}
        </span>
        <span className="sent-news-title">{article.title}</span>
      </div>
      <div className="sent-news-meta">
        {article.source} &middot; {timeAgo(article.publishedAt)} &middot; {article.topics.join(', ')}
      </div>
      {article.entities.length > 0 && (
        <div className="sent-news-entities">
          {article.entities.slice(0, 5).map((entity) => (
            <EntitySentimentBadge key={entity.symbol} entity={entity} />
          ))}
          {article.entities.length > 5 && (
            <span className="sent-text-muted sent-text-sm">+{article.entities.length - 5} more</span>
          )}
        </div>
      )}
      {onImpactAnalysis && primaryEntity && (
        <div style={{ marginTop: 6 }}>
          <button className="sent-link" onClick={() => onImpactAnalysis(article.id)}>
            Impact Analysis &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
