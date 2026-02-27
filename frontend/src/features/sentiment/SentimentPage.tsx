import { useSentimentStore } from './stores/sentimentStore';
import { useSentimentWebSocket } from './hooks/useSentimentWebSocket';
import { SentimentDashboard } from './SentimentDashboard';
import { NewsFeed } from './news/NewsFeed';
import { SocialPulse } from './social/SocialPulse';
import { InstitutionalDashboard } from './institutional/InstitutionalDashboard';
import { EarningsCalendar } from './earnings/EarningsCalendar';
import { EventTimeline } from './events/EventTimeline';
import { EntitySentimentProfile } from './profile/EntitySentimentProfile';
import { SentimentWatchlist } from './alerts/SentimentWatchlist';
import './sentiment.css';

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Dashboard' },
  { id: 'news' as const, label: 'News' },
  { id: 'social' as const, label: 'Social' },
  { id: 'institutional' as const, label: 'Institutional' },
  { id: 'earnings' as const, label: 'Earnings' },
  { id: 'events' as const, label: 'Events' },
  { id: 'profile' as const, label: 'Entity Profile' },
  { id: 'alerts' as const, label: 'Watchlist & Alerts' },
];

export function SentimentPage() {
  const activeView = useSentimentStore((s) => s.activeView);
  const setActiveView = useSentimentStore((s) => s.setActiveView);

  // Connect real-time sentiment WebSocket for live updates
  useSentimentWebSocket();

  return (
    <div className="sent-page">
      <nav className="sent-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sent-nav-btn ${activeView === item.id ? 'sent-nav-btn--active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sent-content">
        {activeView === 'dashboard' && <SentimentDashboard />}
        {activeView === 'news' && <NewsFeed standalone />}
        {activeView === 'social' && <SocialPulse />}
        {activeView === 'institutional' && <InstitutionalDashboard />}
        {activeView === 'earnings' && <EarningsCalendar />}
        {activeView === 'events' && <EventTimeline />}
        {activeView === 'profile' && <EntitySentimentProfile />}
        {activeView === 'alerts' && <SentimentWatchlist />}
      </div>
    </div>
  );
}
