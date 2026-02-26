import type { MarketEvent } from '../types/sentiment.types';

interface Props {
  event: MarketEvent;
  icon: string;
  expanded: boolean;
  onToggle: () => void;
}

export function EventCard({ event, icon, expanded, onToggle }: Props) {
  const time = event.eventDate
    ? new Date(event.eventDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="sent-event-item" onClick={onToggle} style={{ cursor: 'pointer' }}>
      <span className="sent-event-time">{time}</span>
      <span className="sent-event-icon">{icon}</span>
      <div className="sent-event-content">
        <div className="sent-event-title">
          {event.title}
          {event.confidence < 0.5 && (
            <span className="sent-badge sent-badge--neutral" style={{ marginLeft: 8 }}>Unconfirmed</span>
          )}
          {event.status === 'occurred' && (
            <span className="sent-badge sent-badge--info" style={{ marginLeft: 8 }}>Occurred</span>
          )}
        </div>
        <div className="sent-event-desc">
          {event.description}
          {event.affectedSymbols.length > 0 && (
            <span> &middot; Affects: {event.affectedSymbols.slice(0, 5).join(', ')}</span>
          )}
        </div>

        {expanded && event.historicalProfile && (
          <div style={{ marginTop: 8, padding: 10, background: '#0d1117', borderRadius: 6 }}>
            <div className="sent-text-sm sent-font-bold sent-mb-8">Historical Profile</div>
            <div className="sent-earnings-grid">
              <div>
                <div className="sent-earnings-label">Occurrences</div>
                <div className="sent-earnings-value">{event.historicalProfile.occurrences}</div>
              </div>
              <div>
                <div className="sent-earnings-label">Avg Impact</div>
                <div className="sent-earnings-value" style={{ color: event.historicalProfile.avgImpact >= 0 ? '#3fb950' : '#f85149' }}>
                  {event.historicalProfile.avgImpact >= 0 ? '+' : ''}{event.historicalProfile.avgImpact.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="sent-earnings-label">Avg Duration</div>
                <div className="sent-earnings-value">{event.historicalProfile.avgDuration} days</div>
              </div>
              <div>
                <div className="sent-earnings-label">Positive Outcome</div>
                <div className="sent-earnings-value">{event.historicalProfile.positiveOutcomePct.toFixed(0)}%</div>
              </div>
            </div>
          </div>
        )}

        {expanded && event.marketReaction && (
          <div style={{ marginTop: 8 }}>
            <span className="sent-text-sm sent-text-muted">Market Reaction: </span>
            <span style={{ fontSize: 12, color: event.marketReaction.dayMove >= 0 ? '#3fb950' : '#f85149' }}>
              1h: {event.marketReaction.immediateMove >= 0 ? '+' : ''}{event.marketReaction.immediateMove.toFixed(1)}%{' '}
              1d: {event.marketReaction.dayMove >= 0 ? '+' : ''}{event.marketReaction.dayMove.toFixed(1)}%{' '}
              1w: {event.marketReaction.weekMove >= 0 ? '+' : ''}{event.marketReaction.weekMove.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
