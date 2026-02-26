// Sentiment & Alternative Data Engine — Type Definitions

// ─── News Sentiment ───

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  sourceCategory: 'premium' | 'mainstream' | 'analyst' | 'press_release' | 'regulatory' | 'other';
  url: string;
  publishedAt: string;
  ingestedAt: string;
  topics: string[];
  entities: ArticleEntity[];
}

export interface ArticleEntity {
  symbol: string;
  sentiment: number;              // -1.0 to +1.0
  confidence: number;             // 0.0 to 1.0
  relevance: 'primary' | 'secondary' | 'mentioned';
}

export interface NewsSentimentSeries {
  symbol: string;
  timestamp: string;
  interval: '5m' | '1h' | '1d';
  score: number;                  // 0–100
  articleCount: number;
  avgConfidence: number;
  dominantTopic: string;
  sourceMix: Record<string, number>;
}

// ─── Social Signals ───

export interface SocialMetrics {
  symbol: string;
  timestamp: string;
  window: '5m' | '1h' | '4h' | '1d';
  mentionCount: number;
  relativeVolume: number;
  volumeAcceleration: number;
  bullishPct: number;
  bearishPct: number;
  neutralPct: number;
  sentimentScore: number;         // 0–100
  sentimentShift: number;
  platformBreakdown: PlatformMetric[];
  avgAccountAge: number;
  botFilteredPct: number;
  avgEngagement: number;
  topKeywords: string[];
  dominantNarrative: string;
}

export interface PlatformMetric {
  platform: string;
  mentionCount: number;
  sentimentScore: number;
}

// ─── Institutional Flow ───

export interface Filing13F {
  id: string;
  filingDate: string;
  reportDate: string;
  managerName: string;
  managerCIK: string;
  totalValue: number;
  positions: Filing13FPosition[];
}

export interface Filing13FPosition {
  symbol: string;
  shares: number;
  value: number;
  changeShares: number;
  changePct: number;
  action: 'new' | 'increased' | 'decreased' | 'sold' | 'unchanged';
}

export interface InsiderTransaction {
  id: string;
  filingDate: string;
  transactionDate: string;
  symbol: string;
  insiderName: string;
  insiderTitle: string;
  transactionType: 'buy' | 'sell' | 'exercise' | 'gift';
  shares: number;
  pricePerShare: number;
  totalValue: number;
  sharesOwned: number;
}

export interface OptionsFlowEntry {
  id: string;
  timestamp: string;
  symbol: string;
  expiration: string;
  strike: number;
  type: 'call' | 'put';
  side: 'buy' | 'sell';
  size: number;
  premium: number;
  impliedVol: number;
  openInterest: number;
  volumeToOI: number;
  classification: 'sweep' | 'block' | 'split' | 'normal';
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface DarkPoolPrint {
  id: string;
  timestamp: string;
  symbol: string;
  shares: number;
  price: number;
  value: number;
  exchange: string;
  aboveAsk: boolean;
  belowBid: boolean;
}

export interface InstitutionalOwnership {
  symbol: string;
  totalInstitutionalShares: number;
  institutionalPct: number;
  quarterlyChange: number;
  netBuyers: number;
  netSellers: number;
  newPositions: number;
  closedPositions: number;
  topBuyers: { name: string; changeShares: number }[];
  topSellers: { name: string; changeShares: number }[];
}

export interface DarkPoolSummary {
  symbol: string;
  date: string;
  totalDarkVolume: number;
  darkPoolPct: number;
  avgPrintSize: number;
  largePrints: number;
  netSentiment: number;
  shortExemptVolume: number;
  shortPctOfVolume: number;
}

export interface InsiderCluster {
  symbol: string;
  transactions: InsiderTransaction[];
  type: 'buy' | 'sell';
  totalValue: number;
  insiderCount: number;
}

// ─── Earnings ───

export interface BeatStats {
  beats: number;
  misses: number;
  total: number;
  pct: number;
}

export interface EarningsProfile {
  symbol: string;
  nextEarningsDate: string;
  nextEarningsTime: 'pre_market' | 'after_close' | 'during_hours';
  daysUntilEarnings: number;
  epsEstimate: number;
  epsWhisper: number | null;
  revenueEstimate: number;
  revenueWhisper: number | null;
  estimateRevisions: { epsUp: number; epsDown: number; revenueUp: number; revenueDown: number };
  beatRate: { eps: BeatStats; revenue: BeatStats };
  avgSurprise: { eps: number; revenue: number };
  avgPostEarningsMove: number;
  avgBeatReaction: number;
  avgMissReaction: number;
  postEarningsDrift: { day5: number; day10: number; day20: number };
  impliedMove: number;
  historicalAvgMove: number;
  impliedVsRealized: number;
  preEarningsSentiment: number;
  analystRevisionTrend: 'up' | 'down' | 'flat';
  earningsScore: number;
  earningsScoreLabel: string;
}

// ─── Events ───

export type EventType =
  | 'fda_decision' | 'ma_announcement' | 'ma_rumor' | 'index_rebalance'
  | 'lockup_expiration' | 'dividend_announcement' | 'stock_split' | 'buyback'
  | 'executive_change' | 'patent_ruling' | 'regulatory_action' | 'credit_rating'
  | 'geopolitical' | 'macro_data';

export interface EventHistoricalProfile {
  occurrences: number;
  avgImpact: number;
  impactStdDev: number;
  avgDuration: number;
  positiveOutcomePct: number;
}

export interface EventMarketReaction {
  immediateMove: number;
  dayMove: number;
  weekMove: number;
}

export interface MarketEvent {
  id: string;
  type: EventType;
  symbol?: string;
  affectedSymbols: string[];
  title: string;
  description: string;
  source: string;
  detectedAt: string;
  eventDate?: string;
  status: 'upcoming' | 'occurred' | 'resolved';
  confidence: number;
  historicalProfile?: EventHistoricalProfile;
  sentimentImpact: number;
  marketReaction?: EventMarketReaction;
}

// ─── Composite & Convergence ───

export type ConvergenceType =
  | 'full_bullish' | 'full_bearish' | 'smart_money_divergence'
  | 'crowd_fade' | 'catalyst_setup' | 'divergent' | 'neutral';

export interface CompositeSentiment {
  symbol: string;
  timestamp: string;
  composite: number;              // 0–100
  components: {
    news: number;
    social: number;
    institutional: number;
    options: number;
    earnings: number;
    event: number;
  };
  convergenceScore: number;       // -1 to +1
  convergenceType: ConvergenceType;
}

// ─── Dashboard ───

export interface MarketMoodData {
  overallSentiment: number;
  overallLabel: string;
  fearGreedIndex: number;
  newsTone: number;
  socialBuzz: number;
  institutionalFlow: number;
  institutionalFlowLabel: string;
  vix: number;
  vixChange: number;
}

export interface SentimentMover {
  symbol: string;
  currentScore: number;
  previousScore: number;
  change: number;
  primaryDriver: 'news' | 'social' | 'institutional' | 'options' | 'event';
  driverSummary: string;
}

export interface SectorSentiment {
  sector: string;
  score: number;
}

// ─── Sentiment Alerts ───

export type SentimentAlertType =
  | 'sentiment_shift' | 'news_flip' | 'social_volume_spike'
  | 'insider_cluster_buy' | 'insider_cluster_sell' | 'unusual_options'
  | 'earnings_approaching' | 'event_approaching' | 'convergence' | 'divergence'
  | 'bot_warning';

export interface SentimentAlert {
  id: string;
  userId: string;
  symbol: string;
  alertType: SentimentAlertType;
  triggerValue: number;
  currentValue: number;
  message: string;
  priority: 'low' | 'medium' | 'high';
  triggeredAt: string;
  readAt?: string;
}

export interface SentimentAlertConfig {
  symbol: string;
  sentimentShift: { enabled: boolean; threshold: number };
  newsFlip: { enabled: boolean };
  socialVolumeSpike: { enabled: boolean; multiplier: number };
  insiderCluster: { enabled: boolean };
  unusualOptions: { enabled: boolean };
  earningsApproaching: { enabled: boolean; daysBefore: number };
  eventApproaching: { enabled: boolean; daysBefore: number };
  convergence: { enabled: boolean; threshold: number };
  divergence: { enabled: boolean; threshold: number };
}

// ─── Watchlist ───

export interface WatchlistEntry {
  symbol: string;
  composite: number;
  news: number;
  social: number;
  institutional: number;
  change24h: number;
  hasAlert: boolean;
}

// ─── Sentiment Indicators ───

export interface SentimentIndicatorDef {
  code: string;
  name: string;
  category: 'sentiment';
  subcategory: 'news' | 'social' | 'institutional' | 'earnings' | 'event' | 'composite';
  params: {
    name: string;
    default: number;
    min: number;
    max: number;
    description: string;
  }[];
  outputRange: { min: number; max: number };
  availableTimeframes: string[];
  description: string;
}

export interface SentimentIndicatorValue {
  symbol: string;
  timestamp: string;
  indicatorCode: string;
  value: number;
  params: Record<string, number>;
}

// ─── Impact Analysis ───

export interface ImpactAnalysis {
  articleId: string;
  title: string;
  historicalPrecedent: {
    similarEvents: number;
    avgFiveDayImpact: number;
    description: string;
  };
  affectedEntities: {
    symbol: string;
    sentimentBefore: number;
    sentimentAfter: number;
    change: number;
    impactType: string;
  }[];
  marketContext: string[];
}

// ─── Effectiveness Analysis ───

export interface SentimentEffectiveness {
  symbol: string;
  period: string;
  indicators: {
    name: string;
    predictivePower: number;
    bestTimeframe: string;
    lag: string;
    stars: number;
  }[];
  keyFinding: string;
  recommendation: string;
}

// ─── Earnings Quick Backtest ───

export type EarningsPlayType =
  | 'pre_earnings_momentum'
  | 'post_earnings_drift'
  | 'straddle_play'
  | 'earnings_fade';

export interface EarningsBacktestResult {
  playType: EarningsPlayType;
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  trades: {
    date: string;
    entryPrice: number;
    exitPrice: number;
    returnPct: number;
    won: boolean;
  }[];
}

// ─── News Feed Filters ───

export interface NewsFeedFilters {
  topic?: string;
  source?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  symbol?: string;
}

// ─── WebSocket Messages ───

export interface SentimentUpdateMessage {
  type: 'sentiment.update';
  symbol: string;
  composite: number;
  components: CompositeSentiment['components'];
}

export interface SentimentNewsMessage {
  type: 'sentiment.news';
  article: NewsArticle;
}

export interface SentimentSocialSpikeMessage {
  type: 'sentiment.social_spike';
  symbol: string;
  volume: number;
  relativeVolume: number;
}

export interface SentimentInsiderMessage {
  type: 'sentiment.insider';
  transaction: InsiderTransaction;
}

export interface SentimentOptionsFlowMessage {
  type: 'sentiment.options_flow';
  entry: OptionsFlowEntry;
}

export interface SentimentEventMessage {
  type: 'sentiment.event';
  event: MarketEvent;
}

export interface SentimentAlertMessage {
  type: 'sentiment.alert';
  alert: SentimentAlert;
}

export type SentimentWebSocketMessage =
  | SentimentUpdateMessage
  | SentimentNewsMessage
  | SentimentSocialSpikeMessage
  | SentimentInsiderMessage
  | SentimentOptionsFlowMessage
  | SentimentEventMessage
  | SentimentAlertMessage;
