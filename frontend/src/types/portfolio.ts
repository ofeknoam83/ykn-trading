// Portfolio Operations Center — Type Definitions

export type AssetClass = 'stock' | 'crypto' | 'option' | 'etf' | 'bond' | 'commodity' | 'derivative';

export interface PnLData {
  amount: number;
  percent: number;
  realized: number;
  unrealized: number;
}

export interface PositionGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  iv: number;
}

export interface TradeRecord {
  id: string;
  timestamp: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  fees: number;
  source_type: 'strategy' | 'agent' | 'manual' | 'script';
  source_id: string;
  source_name: string;
  order_id: string;
}

export interface PositionAttribution {
  source_type: 'strategy' | 'agent' | 'manual' | 'script';
  source_id: string;
  source_name: string;
  quantity: number;
  avg_cost: number;
  pnl: PnLData;
  entry_trades: TradeRecord[];
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  asset_class: AssetClass;
  exchange: string;
  side: 'long' | 'short';
  quantity: number;
  avg_cost: number;
  current_price: number;
  market_value: number;
  weight_pct: number;
  day_pnl: PnLData;
  total_pnl: PnLData;
  attributions: PositionAttribution[];
  greeks?: PositionGreeks;
  expiry?: string;
  strike?: number;
  option_type?: 'call' | 'put';
  first_entry: string;
  last_activity: string;
}

export interface PortfolioAggregations {
  by_sector: Record<string, { weight_pct: number; market_value: number; pnl: PnLData }>;
  by_asset_class: Record<string, { weight_pct: number; market_value: number; pnl: PnLData }>;
  by_source: Record<string, { weight_pct: number; market_value: number; pnl: PnLData }>;
}

export interface Portfolio {
  total_value: number;
  cash: number;
  invested_value: number;
  margin_used?: number;
  margin_limit?: number;
  day_pnl: PnLData;
  total_pnl: PnLData;
  positions: Position[];
  aggregations: PortfolioAggregations;
}

export interface PortfolioResponse {
  mode: 'paper' | 'live';
  total_value: number;
  cash: number;
  invested_value: number;
  margin_used: number;
  margin_limit: number;
  day_pnl: PnLData;
  total_pnl: PnLData;
  positions: Position[];
  active_strategies: number;
  active_agents: number;
  active_alerts: number;
  last_updated: string;
}

// Orders

export interface OrderRecord {
  id: string;
  timestamp: string;
  symbol: string;
  side: 'buy' | 'sell';
  order_type: 'market' | 'limit' | 'stop';
  quantity: number;
  filled_quantity: number;
  price?: number;
  limit_price?: number;
  stop_price?: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  source_type: 'strategy' | 'agent' | 'manual' | 'script';
  source_id: string;
  source_name: string;
  fees: number;
  created_at: string;
  updated_at: string;
}

// Risk

export interface ExposureSummary {
  gross_exposure: number;
  gross_exposure_pct: number;
  net_exposure: number;
  net_exposure_pct: number;
  long_exposure: number;
  long_exposure_pct: number;
  short_exposure: number;
  short_exposure_pct: number;
  cash: number;
  cash_pct: number;
  leverage: number;
  beta: number;
}

export interface ConcentrationData {
  dimension: 'sector' | 'asset_class' | 'source';
  segments: { name: string; weight_pct: number; market_value: number }[];
  warnings: { message: string; current_pct: number; threshold_pct: number }[];
}

export interface CorrelationEntry {
  symbol_a: string;
  symbol_b: string;
  correlation: number;
}

export interface AggregateGreeks {
  net_delta: number;
  net_gamma: number;
  net_theta: number;
  net_vega: number;
  by_underlying: { symbol: string; delta: number; contracts: number }[];
}

export interface VaRData {
  daily_var_95: number;
  daily_var_95_pct: number;
  daily_var_99: number;
  daily_var_99_pct: number;
  weekly_var_95: number;
  weekly_var_95_pct: number;
  worst_case_1y: number;
}

// Activity Log

export type ActivityType =
  | 'order_placed'
  | 'order_filled'
  | 'order_cancelled'
  | 'order_modified'
  | 'position_opened'
  | 'position_closed'
  | 'strategy_started'
  | 'strategy_paused'
  | 'strategy_stopped'
  | 'strategy_rebalanced'
  | 'agent_run_started'
  | 'agent_run_completed'
  | 'agent_decision'
  | 'agent_error'
  | 'alert_triggered'
  | 'alert_action_taken'
  | 'emergency_pause'
  | 'emergency_flatten'
  | 'mode_switch';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: ActivityType;
  source_type: 'strategy' | 'agent' | 'manual' | 'system' | 'alert';
  source_name: string;
  summary: string;
  details?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'success';
}

// Alerts

export type AlertType =
  | 'price_cross'
  | 'pnl_threshold'
  | 'position_size'
  | 'drawdown'
  | 'concentration'
  | 'volatility'
  | 'margin'
  | 'agent_error'
  | 'strategy_error';

export type AlertConfig =
  | { type: 'price_cross'; symbol: string; direction: 'above' | 'below'; price: number }
  | { type: 'pnl_threshold'; scope: 'portfolio' | 'source'; source_id?: string; direction: 'above' | 'below'; amount?: number; percent?: number }
  | { type: 'position_size'; symbol: string; max_weight_pct: number }
  | { type: 'drawdown'; scope: 'portfolio' | 'source'; source_id?: string; max_drawdown_pct: number }
  | { type: 'concentration'; dimension: 'sector' | 'asset_class' | 'single_position'; max_pct: number }
  | { type: 'volatility'; metric: 'vix' | 'realized'; direction: 'above' | 'below'; threshold: number }
  | { type: 'margin'; max_usage_pct: number }
  | { type: 'agent_error'; agent_id: string }
  | { type: 'strategy_error'; strategy_id: string };

export type AlertAction =
  | { type: 'notify' }
  | { type: 'pause_source'; source_id: string }
  | { type: 'close_positions'; source_id?: string }
  | { type: 'disable_trading'; agent_id: string };

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  type: AlertType;
  config: AlertConfig;
  actions: AlertAction[];
  cooldown_minutes: number;
  created_at: string;
  last_triggered?: string;
}

export interface AlertTrigger {
  alert_id: string;
  rule_name: string;
  type: AlertType;
  message: string;
  severity: 'warning' | 'critical';
  triggered_at: string;
  actions_taken: AlertAction[];
  current_value: unknown;
  threshold_value: unknown;
}

// Automation Status

export interface StrategyStatus {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'paused' | 'stopped' | 'error';
  started_at: string;
  positions_count: number;
  day_pnl: PnLData;
  total_pnl: PnLData;
  last_action?: string;
  next_scheduled?: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  model: string;
  status: 'running' | 'paused' | 'stopped' | 'error';
  run_mode: string;
  current_run?: number;
  day_pnl: PnLData;
  total_pnl: PnLData;
  last_decision?: string;
  next_run?: string;
  enabled_tools: string[];
  trading_enabled: boolean;
}

// WebSocket Events

export type PortfolioEvent =
  | { type: 'price_update'; symbol: string; price: number; timestamp: string }
  | { type: 'order_update'; order: OrderRecord }
  | { type: 'position_update'; position: Position }
  | { type: 'portfolio_update'; snapshot: Partial<PortfolioResponse> }
  | { type: 'strategy_status'; strategy_id: string; status: string }
  | { type: 'agent_status'; agent_id: string; status: string };

// Grouping

export type GroupingMode = 'source' | 'asset_class' | 'sector' | 'none';

// Log Filters

export interface LogFilters {
  source?: string;
  type?: ActivityType;
  from?: string;
  to?: string;
  search?: string;
}
