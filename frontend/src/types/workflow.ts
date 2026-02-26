import { z } from 'zod';

// ─── Top-Level Workflow ───

export interface Workflow {
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
  entry_step_id: string;
  run_mode: RunMode;
  trigger_config?: TriggerConfig;
}

// ─── Steps ───

export interface WorkflowStep {
  id: string;
  type: StepType;
  label: string;
  config: StepConfig;
  position?: { x: number; y: number };
}

export type StepType =
  | 'analyze_market'
  | 'fetch_portfolio'
  | 'evaluate_positions'
  | 'research'
  | 'decide_actions'
  | 'execute'
  | 'report'
  | 'condition'
  | 'custom';

export type StepConfig =
  | AnalyzeMarketConfig
  | FetchPortfolioConfig
  | EvaluatePositionsConfig
  | ResearchConfig
  | DecideActionsConfig
  | ExecuteConfig
  | ReportConfig
  | ConditionConfig
  | CustomConfig;

// ─── Edges ───

export interface WorkflowEdge {
  id: string;
  source_step_id: string;
  target_step_id: string;
  condition_branch?: 'true' | 'false';
}

// ─── Run Mode ───

export type RunMode = 'once' | 'scheduled' | 'triggered';

export interface TriggerConfig {
  schedule?: {
    type: 'interval' | 'cron';
    interval_minutes?: number;
    cron_expression?: string;
  };
  trigger?: {
    type: TriggerType;
    params: Record<string, unknown>;
  };
}

export type TriggerType =
  | 'price_cross'
  | 'news_keyword'
  | 'portfolio_delta'
  | 'volatility_spike'
  | 'time_of_day';

// ─── Step Config Interfaces ───

export type AnalysisFocus = 'price_action' | 'volume' | 'technicals' | 'news_sentiment' | 'sector_trends';

export interface AnalyzeMarketConfig {
  assets: string[];
  depth: 'brief' | 'thorough';
  focus_areas: AnalysisFocus[];
}

export interface FetchPortfolioConfig {
  include_open_orders: boolean;
  include_historical_positions: boolean;
  lookback_days?: number;
}

export interface EvaluatePositionsConfig {
  risk_thresholds: {
    max_position_pct: number;
    max_drawdown_pct: number;
    stop_loss_pct?: number;
  };
  profit_targets: {
    take_profit_pct?: number;
  };
  evaluate_against: 'entry_price' | 'recent_high' | 'moving_average';
}

export interface ResearchConfig {
  scope: 'single_asset' | 'sector' | 'market_wide';
  target_assets?: string[];
  target_sector?: string;
  time_horizon: '1d' | '1w' | '1m' | '3m';
  include_fundamentals: boolean;
  include_news: boolean;
  include_technicals: boolean;
}

export interface DecideActionsConfig {
  confidence_threshold: number;
  max_trades_per_run: number;
  max_position_size_pct: number;
  allowed_actions: ('buy' | 'sell' | 'hold' | 'increase' | 'decrease')[];
  require_reasoning: boolean;
}

export interface ExecuteConfig {
  approval_mode: 'auto' | 'human_approval';
  order_types_allowed: ('market' | 'limit' | 'stop')[];
  default_order_type: 'market' | 'limit' | 'stop';
  limit_offset_bps?: number;
  dry_run_first: boolean;
}

export interface ReportConfig {
  format: 'brief' | 'detailed';
  include_reasoning_chain: boolean;
  include_portfolio_snapshot: boolean;
  include_market_summary: boolean;
  delivery: 'log_only' | 'store';
}

export type ConditionType =
  | 'volatility_above'
  | 'position_count_above'
  | 'portfolio_pnl_above'
  | 'portfolio_pnl_below'
  | 'market_session'
  | 'news_sentiment'
  | 'time_window'
  | 'custom_expression';

export interface ConditionConfig {
  condition_type: ConditionType;
  params: Record<string, unknown>;
  true_label?: string;
  false_label?: string;
}

export interface CustomConfig {
  instruction: string;
  expected_output: 'text' | 'json' | 'signal';
  output_schema?: string;
}

// ─── Validation ───

export interface WorkflowValidationError {
  level: 'error' | 'warning';
  step_id?: string;
  message: string;
}

// ─── Zod Schemas ───

export const analyzeMarketSchema = z.object({
  assets: z.array(z.string()),
  depth: z.enum(['brief', 'thorough']),
  focus_areas: z.array(z.enum(['price_action', 'volume', 'technicals', 'news_sentiment', 'sector_trends'])).min(1, 'Select at least one focus area'),
});

export const fetchPortfolioSchema = z.object({
  include_open_orders: z.boolean(),
  include_historical_positions: z.boolean(),
  lookback_days: z.number().min(1).max(365).optional(),
});

export const evaluatePositionsSchema = z.object({
  risk_thresholds: z.object({
    max_position_pct: z.number().min(1).max(100),
    max_drawdown_pct: z.number().min(1).max(100),
    stop_loss_pct: z.number().min(0.1).max(100).optional(),
  }),
  profit_targets: z.object({
    take_profit_pct: z.number().min(0.1).max(1000).optional(),
  }),
  evaluate_against: z.enum(['entry_price', 'recent_high', 'moving_average']),
});

export const researchSchema = z.object({
  scope: z.enum(['single_asset', 'sector', 'market_wide']),
  target_assets: z.array(z.string()).optional(),
  target_sector: z.string().optional(),
  time_horizon: z.enum(['1d', '1w', '1m', '3m']),
  include_fundamentals: z.boolean(),
  include_news: z.boolean(),
  include_technicals: z.boolean(),
});

export const decideActionsSchema = z.object({
  confidence_threshold: z.number().min(0).max(100),
  max_trades_per_run: z.number().min(1).max(50),
  max_position_size_pct: z.number().min(1).max(100),
  allowed_actions: z.array(z.enum(['buy', 'sell', 'hold', 'increase', 'decrease'])).min(1, 'Select at least one action'),
  require_reasoning: z.boolean(),
});

export const executeSchema = z.object({
  approval_mode: z.enum(['auto', 'human_approval']),
  order_types_allowed: z.array(z.enum(['market', 'limit', 'stop'])).min(1, 'Select at least one order type'),
  default_order_type: z.enum(['market', 'limit', 'stop']),
  limit_offset_bps: z.number().min(0).max(500).optional(),
  dry_run_first: z.boolean(),
});

export const reportSchema = z.object({
  format: z.enum(['brief', 'detailed']),
  include_reasoning_chain: z.boolean(),
  include_portfolio_snapshot: z.boolean(),
  include_market_summary: z.boolean(),
  delivery: z.enum(['log_only', 'store']),
});

export const conditionSchema = z.object({
  condition_type: z.enum([
    'volatility_above',
    'position_count_above',
    'portfolio_pnl_above',
    'portfolio_pnl_below',
    'market_session',
    'news_sentiment',
    'time_window',
    'custom_expression',
  ]),
  params: z.record(z.string(), z.unknown()),
  true_label: z.string().optional(),
  false_label: z.string().optional(),
});

export const customSchema = z.object({
  instruction: z.string().min(1, 'Instruction is required'),
  expected_output: z.enum(['text', 'json', 'signal']),
  output_schema: z.string().optional(),
});

// ─── Default Workflow ───

export function createDefaultWorkflow(): Workflow {
  return {
    steps: [],
    edges: [],
    entry_step_id: '',
    run_mode: 'once',
  };
}
