import { useEffect } from 'react';
import { useSentimentStore } from './stores/sentimentStore';
import { MarketMoodBar } from './dashboard/MarketMoodBar';
import { SentimentMovers } from './dashboard/SentimentMovers';
import { SectorSentimentHeatmap } from './dashboard/SectorSentimentHeatmap';
import { UpcomingCatalysts } from './dashboard/UpcomingCatalysts';
import { CrossSignalWidget } from './dashboard/CrossSignalWidget';
import { NewsFeed } from './news/NewsFeed';
import { TrendingTickers } from './social/TrendingTickers';
import { InstitutionalHighlights } from './institutional/InstitutionalHighlights';
import { getSentimentDashboard } from '../../api/sentimentApi';

export function SentimentDashboard() {
  const setMarketMood = useSentimentStore((s) => s.setMarketMood);
  const setSentimentMovers = useSentimentStore((s) => s.setSentimentMovers);
  const setSectorHeatmap = useSentimentStore((s) => s.setSectorHeatmap);
  const setUpcomingCatalysts = useSentimentStore((s) => s.setUpcomingCatalysts);
  const setDashboardLoading = useSentimentStore((s) => s.setDashboardLoading);
  const dashboardLoading = useSentimentStore((s) => s.dashboardLoading);

  useEffect(() => {
    let cancelled = false;
    setDashboardLoading(true);
    getSentimentDashboard()
      .then((data) => {
        if (cancelled) return;
        setMarketMood(data.mood);
        setSentimentMovers(data.movers);
        setSectorHeatmap(data.sectorHeatmap);
        setUpcomingCatalysts(data.catalysts);
      })
      .catch(() => {/* API may not be available yet */})
      .finally(() => { if (!cancelled) setDashboardLoading(false); });
    return () => { cancelled = true; };
  }, [setMarketMood, setSentimentMovers, setSectorHeatmap, setUpcomingCatalysts, setDashboardLoading]);

  if (dashboardLoading) {
    return <div className="sent-loading">Loading sentiment dashboard...</div>;
  }

  return (
    <div>
      <MarketMoodBar />

      <div className="sent-grid-2">
        <SentimentMovers />
        <NewsFeed maxItems={5} />
      </div>

      <div className="sent-grid-2">
        <TrendingTickers />
        <InstitutionalHighlights />
      </div>

      <UpcomingCatalysts />

      <div className="sent-grid-2">
        <SectorSentimentHeatmap />
        <CrossSignalWidget />
      </div>
    </div>
  );
}
