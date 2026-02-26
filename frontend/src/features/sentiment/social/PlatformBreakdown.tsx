import { sentimentColor } from '../utils/sentimentColorScale';
import type { PlatformMetric } from '../types/sentiment.types';

interface Props {
  platforms: PlatformMetric[];
}

export function PlatformBreakdown({ platforms }: Props) {
  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">By Platform</span>
      </div>
      <div className="sent-card-body">
        {platforms.length === 0 ? (
          <div className="sent-empty">No platform data</div>
        ) : (
          platforms.map((p) => (
            <div key={p.platform} className="sent-flow-entry">
              <span style={{ fontWeight: 600, minWidth: 80, color: '#e6edf3' }}>{p.platform}</span>
              <span className="sent-text-muted" style={{ minWidth: 100 }}>
                {p.mentionCount.toLocaleString()} mentions
              </span>
              <span style={{ color: sentimentColor(p.sentimentScore), fontWeight: 600 }}>
                Sentiment: {p.sentimentScore}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
