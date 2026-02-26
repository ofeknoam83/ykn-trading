import { create } from 'zustand';
import type {
  MarketMoodData,
  SentimentMover,
  SectorSentiment,
  MarketEvent,
  NewsArticle,
  NewsFeedFilters,
  SocialMetrics,
  Filing13F,
  InsiderCluster,
  OptionsFlowEntry,
  EarningsProfile,
  CompositeSentiment,
  SentimentAlert,
  WatchlistEntry,
} from '../types/sentiment.types';

interface SentimentStore {
  // ─── Dashboard ───
  marketMood: MarketMoodData | null;
  sentimentMovers: { positive: SentimentMover[]; negative: SentimentMover[] };
  sectorHeatmap: SectorSentiment[];
  upcomingCatalysts: MarketEvent[];
  dashboardLoading: boolean;

  // ─── News ───
  newsFeed: NewsArticle[];
  newsFeedLoading: boolean;
  newsFeedFilters: NewsFeedFilters;

  // ─── Social ───
  trendingTickers: { symbol: string; volume: number; sentiment: number }[];
  socialMetrics: Record<string, SocialMetrics>;

  // ─── Institutional ───
  filing13FHighlights: Filing13F[];
  insiderClusters: InsiderCluster[];
  optionsFlowFeed: OptionsFlowEntry[];

  // ─── Earnings ───
  earningsCalendar: EarningsProfile[];

  // ─── Events ───
  eventTimeline: MarketEvent[];

  // ─── Entity Profile ───
  activeProfile: CompositeSentiment | null;
  activeProfileSymbol: string | null;
  profileTab: 'summary' | 'news' | 'social' | 'institutional' | 'earnings' | 'events' | 'history';

  // ─── Convergence ───
  convergenceAlerts: CompositeSentiment[];

  // ─── Alerts & Watchlist ───
  sentimentAlerts: SentimentAlert[];
  unreadSentimentAlertCount: number;
  sentimentWatchlist: WatchlistEntry[];

  // ─── View State ───
  activeView: 'dashboard' | 'news' | 'social' | 'institutional' | 'earnings' | 'events' | 'profile' | 'alerts';

  // ─── Actions ───
  setMarketMood: (mood: MarketMoodData) => void;
  setSentimentMovers: (movers: { positive: SentimentMover[]; negative: SentimentMover[] }) => void;
  setSectorHeatmap: (heatmap: SectorSentiment[]) => void;
  setUpcomingCatalysts: (catalysts: MarketEvent[]) => void;
  setDashboardLoading: (loading: boolean) => void;

  setNewsFeed: (articles: NewsArticle[]) => void;
  addNewsArticle: (article: NewsArticle) => void;
  setNewsFeedLoading: (loading: boolean) => void;
  setNewsFeedFilters: (filters: NewsFeedFilters) => void;

  setTrendingTickers: (tickers: { symbol: string; volume: number; sentiment: number }[]) => void;
  setSocialMetrics: (symbol: string, metrics: SocialMetrics) => void;

  setFiling13FHighlights: (filings: Filing13F[]) => void;
  setInsiderClusters: (clusters: InsiderCluster[]) => void;
  setOptionsFlowFeed: (flow: OptionsFlowEntry[]) => void;
  addOptionsFlowEntry: (entry: OptionsFlowEntry) => void;

  setEarningsCalendar: (earnings: EarningsProfile[]) => void;
  setEventTimeline: (events: MarketEvent[]) => void;
  addEvent: (event: MarketEvent) => void;

  setActiveProfile: (profile: CompositeSentiment | null) => void;
  setActiveProfileSymbol: (symbol: string | null) => void;
  setProfileTab: (tab: SentimentStore['profileTab']) => void;

  setConvergenceAlerts: (alerts: CompositeSentiment[]) => void;

  addSentimentAlert: (alert: SentimentAlert) => void;
  markSentimentAlertRead: (id: string) => void;
  setSentimentWatchlist: (watchlist: WatchlistEntry[]) => void;
  addToWatchlist: (entry: WatchlistEntry) => void;
  removeFromWatchlist: (symbol: string) => void;

  setActiveView: (view: SentimentStore['activeView']) => void;
}

export const useSentimentStore = create<SentimentStore>((set) => ({
  // Initial state
  marketMood: null,
  sentimentMovers: { positive: [], negative: [] },
  sectorHeatmap: [],
  upcomingCatalysts: [],
  dashboardLoading: false,

  newsFeed: [],
  newsFeedLoading: false,
  newsFeedFilters: {},

  trendingTickers: [],
  socialMetrics: {},

  filing13FHighlights: [],
  insiderClusters: [],
  optionsFlowFeed: [],

  earningsCalendar: [],

  eventTimeline: [],

  activeProfile: null,
  activeProfileSymbol: null,
  profileTab: 'summary',

  convergenceAlerts: [],

  sentimentAlerts: [],
  unreadSentimentAlertCount: 0,
  sentimentWatchlist: [],

  activeView: 'dashboard',

  // Actions
  setMarketMood: (mood) => set({ marketMood: mood }),
  setSentimentMovers: (movers) => set({ sentimentMovers: movers }),
  setSectorHeatmap: (heatmap) => set({ sectorHeatmap: heatmap }),
  setUpcomingCatalysts: (catalysts) => set({ upcomingCatalysts: catalysts }),
  setDashboardLoading: (loading) => set({ dashboardLoading: loading }),

  setNewsFeed: (articles) => set({ newsFeed: articles }),
  addNewsArticle: (article) =>
    set((state) => ({ newsFeed: [article, ...state.newsFeed].slice(0, 200) })),
  setNewsFeedLoading: (loading) => set({ newsFeedLoading: loading }),
  setNewsFeedFilters: (filters) => set({ newsFeedFilters: filters }),

  setTrendingTickers: (tickers) => set({ trendingTickers: tickers }),
  setSocialMetrics: (symbol, metrics) =>
    set((state) => ({ socialMetrics: { ...state.socialMetrics, [symbol]: metrics } })),

  setFiling13FHighlights: (filings) => set({ filing13FHighlights: filings }),
  setInsiderClusters: (clusters) => set({ insiderClusters: clusters }),
  setOptionsFlowFeed: (flow) => set({ optionsFlowFeed: flow }),
  addOptionsFlowEntry: (entry) =>
    set((state) => ({ optionsFlowFeed: [entry, ...state.optionsFlowFeed].slice(0, 200) })),

  setEarningsCalendar: (earnings) => set({ earningsCalendar: earnings }),
  setEventTimeline: (events) => set({ eventTimeline: events }),
  addEvent: (event) =>
    set((state) => ({ eventTimeline: [event, ...state.eventTimeline].slice(0, 200) })),

  setActiveProfile: (profile) => set({ activeProfile: profile }),
  setActiveProfileSymbol: (symbol) => set({ activeProfileSymbol: symbol }),
  setProfileTab: (tab) => set({ profileTab: tab }),

  setConvergenceAlerts: (alerts) => set({ convergenceAlerts: alerts }),

  addSentimentAlert: (alert) =>
    set((state) => ({
      sentimentAlerts: [alert, ...state.sentimentAlerts].slice(0, 200),
      unreadSentimentAlertCount: state.unreadSentimentAlertCount + 1,
    })),
  markSentimentAlertRead: (id) =>
    set((state) => ({
      sentimentAlerts: state.sentimentAlerts.map((a) =>
        a.id === id ? { ...a, readAt: new Date().toISOString() } : a,
      ),
      unreadSentimentAlertCount: Math.max(0, state.unreadSentimentAlertCount - 1),
    })),
  setSentimentWatchlist: (watchlist) => set({ sentimentWatchlist: watchlist }),
  addToWatchlist: (entry) =>
    set((state) => ({
      sentimentWatchlist: [...state.sentimentWatchlist.filter((w) => w.symbol !== entry.symbol), entry],
    })),
  removeFromWatchlist: (symbol) =>
    set((state) => ({
      sentimentWatchlist: state.sentimentWatchlist.filter((w) => w.symbol !== symbol),
    })),

  setActiveView: (view) => set({ activeView: view }),
}));
