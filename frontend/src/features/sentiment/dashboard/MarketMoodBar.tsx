import { useSentimentStore } from '../stores/sentimentStore';
import { sentimentColor, sentimentLabel } from '../utils/sentimentColorScale';

export function MarketMoodBar() {
  const mood = useSentimentStore((s) => s.marketMood);

  if (!mood) {
    return (
      <div className="sent-mood-bar">
        <span className="sent-text-muted">Loading market mood...</span>
      </div>
    );
  }

  return (
    <div className="sent-mood-bar">
      <div className="sent-mood-item">
        <span className="sent-mood-label">Overall Sentiment</span>
        <span className="sent-mood-value" style={{ color: sentimentColor(mood.overallSentiment) }}>
          {sentimentLabel(mood.overallSentiment)} ({mood.overallSentiment})
        </span>
      </div>
      <div className="sent-mood-divider" />
      <div className="sent-mood-item">
        <span className="sent-mood-label">Fear & Greed</span>
        <span className="sent-mood-value">{mood.fearGreedIndex}</span>
      </div>
      <div className="sent-mood-divider" />
      <div className="sent-mood-item">
        <span className="sent-mood-label">News Tone</span>
        <span className="sent-mood-value" style={{ color: mood.newsTone >= 0 ? '#3fb950' : '#f85149' }}>
          {mood.newsTone >= 0 ? '+' : ''}{mood.newsTone.toFixed(2)}
        </span>
      </div>
      <div className="sent-mood-divider" />
      <div className="sent-mood-item">
        <span className="sent-mood-label">Social Buzz</span>
        <span className="sent-mood-value">
          {mood.socialBuzz >= 2 ? 'Elevated' : mood.socialBuzz >= 1.2 ? 'Normal' : 'Low'} ({mood.socialBuzz.toFixed(1)}x)
        </span>
      </div>
      <div className="sent-mood-divider" />
      <div className="sent-mood-item">
        <span className="sent-mood-label">Institutional Flow</span>
        <span className="sent-mood-value" style={{ color: mood.institutionalFlow >= 0 ? '#3fb950' : '#f85149' }}>
          {mood.institutionalFlowLabel}
        </span>
      </div>
      <div className="sent-mood-divider" />
      <div className="sent-mood-item">
        <span className="sent-mood-label">VIX</span>
        <span className="sent-mood-value">
          {mood.vix.toFixed(1)}{' '}
          <span style={{ fontSize: 12, color: mood.vixChange < 0 ? '#3fb950' : '#f85149' }}>
            ({mood.vixChange >= 0 ? '+' : ''}{mood.vixChange.toFixed(1)})
          </span>
        </span>
      </div>
    </div>
  );
}
