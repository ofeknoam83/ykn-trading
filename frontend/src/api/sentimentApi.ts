import { api } from './client';
import type {
  MarketMoodData,
  SentimentMover,
  SectorSentiment,
  NewsArticle,
  NewsFeedFilters,
  NewsSentimentSeries,
  ImpactAnalysis,
  SocialMetrics,
  Filing13F,
  InsiderTransaction,
  InsiderCluster,
  OptionsFlowEntry,
  DarkPoolSummary,
  EarningsProfile,
  EarningsBacktestResult,
  EarningsPlayType,
  MarketEvent,
  CompositeSentiment,
  SentimentAlert,
  SentimentAlertConfig,
  WatchlistEntry,
  SentimentIndicatorDef,
  SentimentIndicatorValue,
  SentimentEffectiveness,
} from '../features/sentiment/types/sentiment.types';

// ─── Dashboard & Overview ───

export async function getSentimentDashboard() {
  const { data } = await api.get<{
    mood: MarketMoodData;
    movers: { positive: SentimentMover[]; negative: SentimentMover[] };
    sectorHeatmap: SectorSentiment[];
    catalysts: MarketEvent[];
  }>('/sentiment/dashboard');
  return data;
}

export async function getSentimentMovers() {
  const { data } = await api.get<{ positive: SentimentMover[]; negative: SentimentMover[] }>('/sentiment/movers');
  return data;
}

export async function getSectorHeatmap() {
  const { data } = await api.get<SectorSentiment[]>('/sentiment/sector-heatmap');
  return data;
}

// ─── News Sentiment ───

export async function getNewsSentimentFeed(filters?: NewsFeedFilters) {
  const { data } = await api.get<NewsArticle[]>('/sentiment/news/feed', { params: filters });
  return data;
}

export async function getNewsSentimentSeries(symbol: string, interval = '1h') {
  const { data } = await api.get<NewsSentimentSeries[]>(`/sentiment/news/series/${symbol}`, {
    params: { interval },
  });
  return data;
}

export async function getNewsImpactAnalysis(articleId: string) {
  const { data } = await api.get<ImpactAnalysis>(`/sentiment/news/${articleId}/impact`);
  return data;
}

// ─── Social Signals ───

export async function getSocialMetrics(symbol: string, window = '1h') {
  const { data } = await api.get<SocialMetrics>(`/sentiment/social/${symbol}`, { params: { window } });
  return data;
}

export async function getTrendingSocial() {
  const { data } = await api.get<{ symbol: string; volume: number; sentiment: number }[]>('/sentiment/social/trending');
  return data;
}

export async function getSocialHistory(symbol: string) {
  const { data } = await api.get<SocialMetrics[]>(`/sentiment/social/${symbol}/history`);
  return data;
}

// ─── Institutional Flow ───

export async function getInstitutionalFlow(symbol: string) {
  const { data } = await api.get<{
    ownership: { totalInstitutionalShares: number; institutionalPct: number; quarterlyChange: number; netBuyers: number; netSellers: number };
    recentInsider: InsiderTransaction[];
    optionsFlow: OptionsFlowEntry[];
    darkPool: DarkPoolSummary;
  }>(`/sentiment/institutional/${symbol}`);
  return data;
}

export async function getRecent13F() {
  const { data } = await api.get<Filing13F[]>('/sentiment/13f/recent');
  return data;
}

export async function get13FBySymbol(symbol: string) {
  const { data } = await api.get<Filing13F[]>(`/sentiment/13f/${symbol}`);
  return data;
}

export async function getInsiderTransactions(symbol: string) {
  const { data } = await api.get<InsiderTransaction[]>(`/sentiment/insider/${symbol}`);
  return data;
}

export async function getInsiderClusters() {
  const { data } = await api.get<InsiderCluster[]>('/sentiment/insider/clusters');
  return data;
}

export async function getOptionsFlow(symbol?: string) {
  const url = symbol ? `/sentiment/options-flow/${symbol}` : '/sentiment/options-flow';
  const { data } = await api.get<OptionsFlowEntry[]>(url);
  return data;
}

export async function getDarkPool(symbol: string) {
  const { data } = await api.get<DarkPoolSummary>(`/sentiment/dark-pool/${symbol}`);
  return data;
}

// ─── Earnings ───

export async function getEarningsCalendar(params?: { start?: string; end?: string; watchlistOnly?: boolean }) {
  const { data } = await api.get<EarningsProfile[]>('/sentiment/earnings/calendar', { params });
  return data;
}

export async function getEarningsProfile(symbol: string) {
  const { data } = await api.get<EarningsProfile>(`/sentiment/earnings/${symbol}`);
  return data;
}

export async function runEarningsBacktest(symbol: string, playType: EarningsPlayType) {
  const { data } = await api.post<EarningsBacktestResult>(`/sentiment/earnings/${symbol}/backtest`, { playType });
  return data;
}

// ─── Events ───

export async function getEventTimeline(params?: { symbol?: string; type?: string }) {
  const { data } = await api.get<MarketEvent[]>('/sentiment/events/timeline', { params });
  return data;
}

export async function getEventsBySymbol(symbol: string) {
  const { data } = await api.get<MarketEvent[]>(`/sentiment/events/${symbol}`);
  return data;
}

export async function getEventDetail(eventId: string) {
  const { data } = await api.get<MarketEvent>(`/sentiment/events/${eventId}`);
  return data;
}

// ─── Entity Profile ───

export async function getEntityProfile(symbol: string) {
  const { data } = await api.get<CompositeSentiment>(`/sentiment/profile/${symbol}`);
  return data;
}

export async function getEntityComposite(symbol: string) {
  const { data } = await api.get<CompositeSentiment>(`/sentiment/profile/${symbol}/composite`);
  return data;
}

export async function getEffectivenessAnalysis(symbol: string) {
  const { data } = await api.get<SentimentEffectiveness>(`/sentiment/profile/${symbol}/effectiveness`);
  return data;
}

// ─── Alerts ───

export async function getSentimentAlerts(page = 1, limit = 50) {
  const { data } = await api.get<{ alerts: SentimentAlert[]; total: number }>('/sentiment/alerts', {
    params: { page, limit },
  });
  return data;
}

export async function configureSentimentAlert(config: SentimentAlertConfig) {
  const { data } = await api.post<SentimentAlertConfig>('/sentiment/alerts/configure', config);
  return data;
}

export async function markSentimentAlertRead(id: string) {
  await api.post(`/sentiment/alerts/${id}/read`);
}

// ─── Watchlist ───

export async function getSentimentWatchlist() {
  const { data } = await api.get<WatchlistEntry[]>('/sentiment/watchlist');
  return data;
}

export async function addToSentimentWatchlist(symbol: string) {
  const { data } = await api.post<WatchlistEntry>(`/sentiment/watchlist/${symbol}`);
  return data;
}

export async function removeFromSentimentWatchlist(symbol: string) {
  await api.delete(`/sentiment/watchlist/${symbol}`);
}

// ─── Indicators ───

export async function getSentimentIndicators() {
  const { data } = await api.get<SentimentIndicatorDef[]>('/sentiment/indicators');
  return data;
}

export async function getSentimentIndicatorValues(
  code: string,
  params: { symbol: string; from: string; to: string; interval: string },
) {
  const { data } = await api.get<SentimentIndicatorValue[]>(`/sentiment/indicators/${code}/values`, { params });
  return data;
}
