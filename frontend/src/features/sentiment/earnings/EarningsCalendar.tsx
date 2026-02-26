import { useEffect, useState } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { EarningsCard } from './EarningsCard';
import { getEarningsCalendar } from '../../../api/sentimentApi';

const RANGE_OPTIONS = ['This Week', 'Next Week', 'This Month'] as const;

export function EarningsCalendar() {
  const earningsCalendar = useSentimentStore((s) => s.earningsCalendar);
  const setEarningsCalendar = useSentimentStore((s) => s.setEarningsCalendar);
  const [range, setRange] = useState<typeof RANGE_OPTIONS[number]>('This Week');
  const [loading, setLoading] = useState(false);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEarningsCalendar()
      .then((data) => { if (!cancelled) setEarningsCalendar(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [setEarningsCalendar]);

  // Group by date
  const grouped = new Map<string, typeof earningsCalendar>();
  for (const e of earningsCalendar) {
    const date = new Date(e.nextEarningsDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(e);
  }

  return (
    <div>
      <div className="sent-flex sent-gap-8 sent-mb-16">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r}
            className={`sent-nav-btn ${range === r ? 'sent-nav-btn--active' : ''}`}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="sent-loading">Loading earnings calendar...</div>
      ) : earningsCalendar.length === 0 ? (
        <div className="sent-empty">No upcoming earnings reports</div>
      ) : (
        Array.from(grouped.entries()).map(([date, profiles]) => (
          <div key={date}>
            <div className="sent-text-sm sent-text-muted sent-font-bold sent-mb-8" style={{ marginTop: 16, paddingBottom: 8, borderBottom: '1px solid #30363d' }}>
              {date}
            </div>
            {profiles.map((profile) => (
              <EarningsCard
                key={profile.symbol}
                profile={profile}
                expanded={expandedSymbol === profile.symbol}
                onToggle={() => setExpandedSymbol(expandedSymbol === profile.symbol ? null : profile.symbol)}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
