import { useSentimentStore } from '../stores/sentimentStore';
import type { MarketEvent } from '../types/sentiment.types';

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

function groupByDay(events: MarketEvent[]): Map<string, MarketEvent[]> {
  const groups = new Map<string, MarketEvent[]>();
  for (const event of events) {
    const dateStr = event.eventDate
      ? new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
      : 'TBD';
    if (!groups.has(dateStr)) groups.set(dateStr, []);
    groups.get(dateStr)!.push(event);
  }
  return groups;
}

export function UpcomingCatalysts() {
  const catalysts = useSentimentStore((s) => s.upcomingCatalysts);
  const days = groupByDay(catalysts);
  const dayEntries = Array.from(days.entries()).slice(0, 5);

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Upcoming Catalysts (Next 5 Trading Days)</span>
      </div>
      <div className="sent-card-body">
        {dayEntries.length === 0 ? (
          <div className="sent-empty">No upcoming catalysts</div>
        ) : (
          <div className="sent-catalyst-strip">
            {dayEntries.map(([day, events]) => (
              <div key={day} className="sent-catalyst-day">
                <div className="sent-catalyst-date">{day}</div>
                {events.slice(0, 4).map((event) => (
                  <div key={event.id} className="sent-catalyst-event">
                    {EVENT_ICONS[event.type] || '\u{1F4C5}'} {event.title}
                  </div>
                ))}
                {events.length > 4 && (
                  <div className="sent-catalyst-event sent-text-muted">+{events.length - 4} more</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
