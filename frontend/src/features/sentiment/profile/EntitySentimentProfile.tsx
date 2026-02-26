import { useState, useEffect } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { SentimentSummaryTab } from './SentimentSummaryTab';
import { SentimentChart } from './SentimentChart';
import { SignalBreakdownTable } from './SignalBreakdownTable';
import { CrossSignalNote } from './CrossSignalNote';
import { SentimentEffectivenessPanel } from './SentimentEffectivenessPanel';
import { NewsFeed } from '../news/NewsFeed';
import { SocialPulse } from '../social/SocialPulse';
import { InsiderTransactionList } from '../institutional/InsiderTransactionList';
import { OptionsFlowFeed } from '../institutional/OptionsFlowFeed';
import { EventTimeline } from '../events/EventTimeline';
import { getEntityProfile } from '../../../api/sentimentApi';

const TABS = [
  { id: 'summary' as const, label: 'Summary' },
  { id: 'news' as const, label: 'News' },
  { id: 'social' as const, label: 'Social' },
  { id: 'institutional' as const, label: 'Institutional' },
  { id: 'events' as const, label: 'Events' },
  { id: 'history' as const, label: 'History' },
];

export function EntitySentimentProfile() {
  const activeProfileSymbol = useSentimentStore((s) => s.activeProfileSymbol);
  const setActiveProfileSymbol = useSentimentStore((s) => s.setActiveProfileSymbol);
  const activeProfile = useSentimentStore((s) => s.activeProfile);
  const setActiveProfile = useSentimentStore((s) => s.setActiveProfile);
  const profileTab = useSentimentStore((s) => s.profileTab);
  const setProfileTab = useSentimentStore((s) => s.setProfileTab);
  const [symbolInput, setSymbolInput] = useState(activeProfileSymbol || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProfileSymbol) return;
    let cancelled = false;
    setLoading(true);
    getEntityProfile(activeProfileSymbol)
      .then((data) => { if (!cancelled) setActiveProfile(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeProfileSymbol, setActiveProfile]);

  const handleSearch = () => {
    if (symbolInput.trim()) {
      setActiveProfileSymbol(symbolInput.trim().toUpperCase());
    }
  };

  return (
    <div>
      <div className="sent-flex sent-gap-8 sent-mb-16">
        <input
          type="text"
          value={symbolInput}
          onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter symbol (e.g., NVDA)"
          style={{ padding: '6px 12px', fontSize: 13, background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', width: 200 }}
        />
        <button className="sent-nav-btn sent-nav-btn--active" onClick={handleSearch}>
          View Profile
        </button>
      </div>

      {!activeProfileSymbol ? (
        <div className="sent-empty">Enter a symbol to view its sentiment profile</div>
      ) : loading ? (
        <div className="sent-loading">Loading profile for {activeProfileSymbol}...</div>
      ) : !activeProfile ? (
        <div className="sent-empty">No sentiment data available for {activeProfileSymbol}</div>
      ) : (
        <div>
          {/* Header */}
          <div className="sent-card sent-mb-16">
            <div className="sent-card-body">
              <SentimentSummaryTab profile={activeProfile} symbol={activeProfileSymbol} />
            </div>
          </div>

          {/* Tabs */}
          <div className="sent-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`sent-tab ${profileTab === tab.id ? 'sent-tab--active' : ''}`}
                onClick={() => setProfileTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {profileTab === 'summary' && (
            <div>
              <SentimentChart symbol={activeProfileSymbol} />
              <SignalBreakdownTable profile={activeProfile} />
              <CrossSignalNote profile={activeProfile} />
            </div>
          )}
          {profileTab === 'news' && <NewsFeed symbol={activeProfileSymbol} standalone />}
          {profileTab === 'social' && <SocialPulse symbol={activeProfileSymbol} />}
          {profileTab === 'institutional' && (
            <div>
              <InsiderTransactionList symbol={activeProfileSymbol} />
              <div style={{ marginTop: 16 }}>
                <OptionsFlowFeed symbol={activeProfileSymbol} />
              </div>
            </div>
          )}
          {profileTab === 'events' && <EventTimeline symbol={activeProfileSymbol} />}
          {profileTab === 'history' && <SentimentEffectivenessPanel symbol={activeProfileSymbol} />}
        </div>
      )}
    </div>
  );
}
