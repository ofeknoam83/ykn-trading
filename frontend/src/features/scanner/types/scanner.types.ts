// Market Scanner & Opportunity Engine — Type Definitions

// ─── Universe & Conditions ───

export type AssetClass = 'us_equity' | 'etf' | 'crypto' | 'forex' | 'futures' | 'options';

export interface UniverseFilter {
  assetClass: AssetClass[];
  exchange?: string[];
  sector?: string[];
  industry?: string[];
  marketCapMin?: number;
  marketCapMax?: number;
  avgVolumeMin?: number;
  priceMin?: number;
  priceMax?: number;
  indexMembership?: string[];
  watchlist?: string[];
  excludeSymbols?: string[];
}

export type ConditionOperator =
  | '<' | '>' | '<=' | '>=' | '=='
  | 'crosses_above' | 'crosses_below'
  | 'between' | 'outside';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1M';

export type ConditionType = 'technical' | 'fundamental' | 'price_action' | 'volume' | 'custom';

export interface ScanCondition {
  id: string;
  type: ConditionType;
  indicator: string;
  params: Record<string, number>;
  operator: ConditionOperator;
  value: number | 'dynamic';
  dynamicRef?: string;
  timeframe: Timeframe;
}

export interface ScanConditionGroup {
  id: string;
  operator: 'AND' | 'OR';
  conditions: (ScanCondition | ScanConditionGroup)[];
}

// ─── Scoring ───

export interface ScoringConfig {
  weights: {
    signalStrength: number;
    historicalHitRate: number;
    regimeCompatibility: number;
    portfolioFit: number;
    recency: number;
  };
  minScore?: number;
}

// ─── Alerts ───

export interface ScanAlertConfig {
  enabled: boolean;
  onNewMatch: boolean;
  onHighScore: boolean;
  highScoreThreshold: number;
  onMatchLost: boolean;
  onConvergence: boolean;
  channels: ('in_app' | 'browser_push' | 'email')[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  maxAlertsPerHour: number;
}

// ─── Scan Definition ───

export interface ScanDefinition {
  id: string;
  userId: string;
  name: string;
  description?: string;
  universe: UniverseFilter;
  rootGroup: ScanConditionGroup;
  convergenceRules?: ConvergenceRule[];
  scoring: ScoringConfig;
  alerts: ScanAlertConfig;
  mode: 'snapshot' | 'monitor';
  status: 'active' | 'paused' | 'draft';
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Multi-timeframe Convergence ───

export interface ConvergenceRule {
  id: string;
  timeframe: Timeframe;
  conditions: ScanCondition[];
  weight: number;
  required: boolean;
}

export interface ConvergenceStatus {
  totalTimeframes: number;
  matchingTimeframes: number;
  details: {
    timeframe: string;
    matched: boolean;
    summary: string;
  }[];
}

// ─── Results ───

export interface ScoreBreakdown {
  signalStrength: { raw: number; weighted: number };
  historicalHitRate: { raw: number; weighted: number };
  regimeCompatibility: { raw: number; weighted: number };
  portfolioFit: { raw: number; weighted: number };
  recency: { raw: number; weighted: number };
  total: number;
}

export interface ConditionMatch {
  conditionId: string;
  indicator: string;
  operator: string;
  threshold: number;
  actual: number;
  strength: number;
}

export interface ScanResult {
  id: string;
  scanId: string;
  symbol: string;
  name: string;
  price: number;
  priceChange: number;
  priceChangePct: number;
  sector: string;
  marketCap: number;
  volumeRatio: number;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  matchedConditions: ConditionMatch[];
  convergenceStatus?: ConvergenceStatus;
  firstMatchedAt: string;
  lastUpdatedAt: string;
  sparklineData: number[];
}

// ─── Anomalies ───

export type AnomalyType =
  | 'correlation_break'
  | 'volume_anomaly'
  | 'volatility_divergence'
  | 'sector_rotation'
  | 'price_volume_divergence'
  | 'cross_asset'
  | 'pattern_anomaly'
  | 'breadth_divergence';

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AnomalyDataPoint {
  metric: string;
  expected: number;
  actual: number;
  deviation: number;
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  score: number;
  symbols: string[];
  description: string;
  detectedAt: string;
  expiresAt: string;
  dataPoints: AnomalyDataPoint[];
  suggestedAction?: string;
  dismissed: boolean;
}

export interface AnomalyConfig {
  correlationBreaks: { enabled: boolean; sigma: number };
  volumeAnomalies: { enabled: boolean; sigma: number };
  volatilityDivergence: { enabled: boolean; sigma: number };
  sectorRotation: { enabled: boolean; sigma: number };
  priceVolumeDivergence: { enabled: boolean; sigma: number };
  crossAssetSignals: { enabled: boolean; sigma: number };
  breadthDivergence: { enabled: boolean; sigma: number };
  cooldownHours: number;
}

// ─── Alerts ───

export type ScanAlertType =
  | 'new_match'
  | 'high_score_match'
  | 'match_lost'
  | 'anomaly_detected'
  | 'convergence_alert'
  | 'portfolio_warning'
  | 'scan_error';

export interface ScanAlert {
  id: string;
  scanId?: string;
  anomalyId?: string;
  userId: string;
  alertType: ScanAlertType;
  symbol?: string;
  score?: number;
  message: string;
  channels: string[];
  sentAt: string;
  readAt?: string;
  actedOn: boolean;
}

// ─── Pipeline ───

export type PipelineActionType =
  | 'quick_backtest'
  | 'build_strategy'
  | 'create_agent'
  | 'add_watchlist'
  | 'set_alert'
  | 'deep_dive';

export interface PipelineAction {
  id: string;
  scanId: string;
  matchId: string;
  symbol: string;
  actionType: PipelineActionType;
  timestamp: string;
  resultId?: string;
}

// ─── Quick Backtest ───

export interface QuickBacktestResult {
  signalsFound: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  expectedValue: number;
  maxConsecutiveLosses: number;
  equityCurve: number[][];
  trades: {
    entryDate: string;
    exitDate: string;
    entryPrice: number;
    exitPrice: number;
    returnPct: number;
    won: boolean;
  }[];
}

export type ExitStrategy = 'hold_1d' | 'hold_5d' | 'hold_10d' | 'hold_20d' | 'rsi_exit' | 'atr_trailing' | 'opposite_signal' | 'target_stop';

// ─── Portfolio Impact ───

export interface PortfolioImpact {
  current: {
    techAllocation: number;
    beta: number;
    hhi: number;
    spyCorrelation: number;
    maxDrawdown: number;
  };
  after: {
    techAllocation: number;
    beta: number;
    hhi: number;
    spyCorrelation: number;
    maxDrawdown: number;
  };
  warnings: string[];
  alternatives: {
    symbol: string;
    sector: string;
    score: number;
    reason: string;
  }[];
}

// ─── Scan Performance ───

export interface ScanPerformanceSnapshot {
  scanId: string;
  date: string;
  matchCount: number;
  uniqueSymbols: number;
  avgScore: number;
  highScoreMatches: number;
  actionsPerformed: number;
}

// ─── Dashboard ───

export interface ScanSummaryCard {
  scanId: string;
  name: string;
  matchCount: number;
  topMatch: { symbol: string; score: number } | null;
  lastMatchTime: string | null;
  status: 'running' | 'paused' | 'error';
  alertsEnabled: boolean;
}

export interface MarketOverview {
  sp500: { value: number; change: number; changePct: number };
  nasdaq: { value: number; change: number; changePct: number };
  russell2000: { value: number; change: number; changePct: number };
  vix: { value: number; change: number };
  regime: string;
  breadth: number;
  newHighs: number;
  newLows: number;
  updatedAt: string;
}

export interface HeatmapCell {
  sector: string;
  signalType: string;
  count: number;
  topSymbols: string[];
}

// ─── Scan Templates ───

export interface ScanTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  conditions: ScanConditionGroup;
  universeDefaults: Partial<UniverseFilter>;
  scoringDefaults: ScoringConfig;
  bestRegime: string;
  historicalHitRate?: number;
  avgMatchesPerDay?: number;
  conditionCount: number;
}

export type TemplateCategory =
  | 'momentum'
  | 'mean_reversion'
  | 'breakout'
  | 'fundamental'
  | 'volume'
  | 'multi_tf'
  | 'income'
  | 'trend'
  | 'volatility'
  | 'cross_asset';

// ─── Indicator Catalog ───

export interface IndicatorDef {
  id: string;
  name: string;
  category: 'momentum' | 'trend' | 'volatility' | 'volume' | 'pattern' | 'valuation' | 'growth' | 'quality' | 'size' | 'relative' | 'gaps' | 'range' | 'support_resistance';
  type: ConditionType;
  defaultParams: Record<string, number>;
  paramLabels: Record<string, string>;
  valueRange?: { min: number; max: number };
  supportedOperators: ConditionOperator[];
  supportedTimeframes: Timeframe[];
  description: string;
}

// ─── WebSocket Messages ───

export interface ScanSubscribeMessage {
  type: 'scan.subscribe';
  scanId: string;
  mode: 'snapshot' | 'monitor';
}

export interface ScanUnsubscribeMessage {
  type: 'scan.unsubscribe';
  scanId: string;
}

export interface ScanResultsMessage {
  type: 'scan.results';
  scanId: string;
  action: 'snapshot' | 'add' | 'remove' | 'update';
  results: ScanResult[];
}

export interface ScanAlertMessage {
  type: 'scan.alert';
  scanId: string;
  symbol: string;
  score: number;
  matchedConditions: string[];
  timestamp: string;
}

export interface AnomalyDetectedMessage {
  type: 'anomaly.detected';
  anomaly: Anomaly;
}

export interface AnomalyExpiredMessage {
  type: 'anomaly.expired';
  anomalyId: string;
}

export interface MarketOverviewMessage {
  type: 'market.overview';
  data: MarketOverview;
}

export type ScannerWebSocketMessage =
  | ScanResultsMessage
  | ScanAlertMessage
  | AnomalyDetectedMessage
  | AnomalyExpiredMessage
  | MarketOverviewMessage;
