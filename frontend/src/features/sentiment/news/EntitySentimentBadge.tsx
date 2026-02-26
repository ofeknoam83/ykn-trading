import { rawSentimentColor } from '../utils/sentimentColorScale';
import type { ArticleEntity } from '../types/sentiment.types';

interface Props {
  entity: ArticleEntity;
}

export function EntitySentimentBadge({ entity }: Props) {
  const color = rawSentimentColor(entity.sentiment);
  return (
    <span className="sent-entity-badge" style={{ borderLeft: `3px solid ${color}` }}>
      <span style={{ color: '#58a6ff', fontWeight: 700 }}>{entity.symbol}</span>
      <span style={{ color, fontSize: 10 }}>
        ({entity.sentiment >= 0 ? '+' : ''}{entity.sentiment.toFixed(1)})
      </span>
    </span>
  );
}
