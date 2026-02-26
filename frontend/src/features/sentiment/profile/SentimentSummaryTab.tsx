import { sentimentColor, sentimentLabel } from '../utils/sentimentColorScale';
import { convergenceLabel } from '../utils/convergenceCalculator';
import type { CompositeSentiment } from '../types/sentiment.types';

interface Props {
  profile: CompositeSentiment;
  symbol: string;
}

export function SentimentSummaryTab({ profile, symbol }: Props) {
  return (
    <div className="sent-flex sent-flex-between sent-flex-center">
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>
          {symbol}
        </div>
        <div className="sent-flex sent-gap-16 sent-flex-center">
          <div>
            <span className="sent-text-muted sent-text-sm">Composite Sentiment: </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: sentimentColor(profile.composite) }}>
              {profile.composite}
            </span>
          </div>
          <span className="sent-score-badge" style={{
            background: `${sentimentColor(profile.composite)}20`,
            color: sentimentColor(profile.composite),
            fontSize: 13,
          }}>
            {sentimentLabel(profile.composite)}
          </span>
          {profile.convergenceType !== 'neutral' && (
            <span className="sent-badge sent-badge--info">
              {convergenceLabel(profile.convergenceType)}
            </span>
          )}
        </div>
      </div>
      <div className="sent-bar" style={{ width: 200 }}>
        <div
          className="sent-bar-fill"
          style={{
            width: `${profile.composite}%`,
            background: sentimentColor(profile.composite),
          }}
        />
      </div>
    </div>
  );
}
