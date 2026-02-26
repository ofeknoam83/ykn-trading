import { useEffect, useState } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { EventCard } from './EventCard';
import { getEventTimeline } from '../../../api/sentimentApi';

const EVENT_ICONS: Record<string, string> = {
  fda_decision: '\u{1F48A}',
  ma_announcement: '\u{1F4B0}',
  ma_rumor: '\u{1F4B0}',
  index_rebalance: '\u{1F504}',
  lockup_expiration: '\u{1F512}',
  dividend_announcement: '\u{1F4B5}',
  stock_split: '\u2702\uFE0F',
  buyback: '\u{1F4C8}',
  executive_change: '\u{1F464}',
  patent_ruling: '\u2696\uFE0F',
  regulatory_action: '\u{1F3DB}\uFE0F',
  credit_rating: '\u2B50',
  geopolitical: '\u{1F30D}',
  macro_data: '\u{1F4CA}',
};

function groupByDate(events: ReturnType<typeof useSentimentStore.getState>['eventTimeline']): Map<string, typeof events> {
  const groups = new Map<string, typeof events>();
  for (const event of events) {
    const dateStr = event.eventDate
      ? new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'Unscheduled';
    if (!groups.has(dateStr)) groups.set(dateStr, []);
    groups.get(dateStr)!.push(event);
  }
  return groups;
}

export function EventTimeline({ symbol: propSymbol }: { symbol?: string } = {}) {
  const eventTimeline = useSentimentStore((s) => s.eventTimeline);
  const setEventTimeline = useSentimentStore((s) => s.setEventTimeline);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEventTimeline(propSymbol ? { symbol: propSymbol } : undefined)
      .then((data) => { if (!cancelled) setEventTimeline(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [propSymbol, setEventTimeline]);

  const grouped = groupByDate(eventTimeline);

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Event Timeline{propSymbol ? `: ${propSymbol}` : ''}</span>
      </div>
      <div className="sent-card-body">
        {loading ? (
          <div className="sent-loading">Loading events...</div>
        ) : eventTimeline.length === 0 ? (
          <div className="sent-empty">No events found</div>
        ) : (
          Array.from(grouped.entries()).map(([date, events]) => (
            <div key={date}>
              <div className="sent-text-sm sent-text-muted sent-font-bold" style={{ padding: '8px 0', borderBottom: '1px solid #30363d' }}>
                {date}
              </div>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  icon={EVENT_ICONS[event.type] || '\u{1F4C5}'}
                  expanded={expandedId === event.id}
                  onToggle={() => setExpandedId(expandedId === event.id ? null : event.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
