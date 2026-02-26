import type { ZodSchema } from 'zod';
import type {
  StepType,
  StepConfig,
  AnalyzeMarketConfig,
  FetchPortfolioConfig,
  EvaluatePositionsConfig,
  ResearchConfig,
  DecideActionsConfig,
  ExecuteConfig,
  ReportConfig,
  ConditionConfig,
  CustomConfig,
} from '../../../types/workflow';
import {
  analyzeMarketSchema,
  fetchPortfolioSchema,
  evaluatePositionsSchema,
  researchSchema,
  decideActionsSchema,
  executeSchema,
  reportSchema,
  conditionSchema,
  customSchema,
} from '../../../types/workflow';
import type { FieldSchema } from '../../../lib/dynamic-form/types';
import { STEP_FIELD_SCHEMAS } from '../../../schemas/workflow-steps';

export interface StepTypeDefinition {
  type: StepType;
  label: string;
  icon: string;
  description: string;
  borderColor: string;
  defaultConfig: StepConfig;
  configSchema: ZodSchema;
  fieldSchema: FieldSchema[];
  summaryFn: (config: StepConfig) => string;
  maxInstances?: number;
  requiresTools?: string[];
}

export function conditionSummary(config: ConditionConfig): string {
  switch (config.condition_type) {
    case 'volatility_above':
      return `VIX > ${config.params.threshold ?? '?'}`;
    case 'position_count_above':
      return `positions > ${config.params.threshold ?? '?'}`;
    case 'portfolio_pnl_above':
      return `PnL > ${config.params.threshold_pct ?? '?'}%`;
    case 'portfolio_pnl_below':
      return `PnL < ${config.params.threshold_pct ?? '?'}%`;
    case 'market_session':
      return `market is ${config.params.session ?? '?'}`;
    case 'news_sentiment': {
      const sym = config.params.symbol ? ` (${config.params.symbol})` : '';
      return `sentiment = ${config.params.sentiment ?? '?'}${sym}`;
    }
    case 'time_window':
      return `${config.params.start_hour ?? '?'}:00–${config.params.end_hour ?? '?'}:00 ${config.params.timezone ?? ''}`;
    case 'custom_expression':
      return (config.params.expression as string) || 'custom expression';
    default:
      return 'unconfigured condition';
  }
}

export const STEP_TYPE_REGISTRY: Record<StepType, StepTypeDefinition> = {
  analyze_market: {
    type: 'analyze_market',
    label: 'Analyze Market',
    icon: '\u{1F50D}',
    description: 'Review current market conditions using available data tools.',
    borderColor: '#58a6ff',
    defaultConfig: {
      assets: [],
      depth: 'brief',
      focus_areas: ['price_action', 'technicals'],
    } as AnalyzeMarketConfig,
    configSchema: analyzeMarketSchema,
    fieldSchema: STEP_FIELD_SCHEMAS.analyze_market,
    summaryFn: (c) => {
      const config = c as AnalyzeMarketConfig;
      const assets = config.assets.length > 0 ? config.assets.join(', ') : 'portfolio assets';
      return `${config.depth} \u00B7 ${assets}`;
    },
  },

  fetch_portfolio: {
    type: 'fetch_portfolio',
    label: 'Fetch Portfolio',
    icon: '\u{1F4CA}',
    description: 'Retrieve current portfolio positions and state.',
    borderColor: '#58a6ff',
    defaultConfig: {
      include_open_orders: true,
      include_historical_positions: false,
    } as FetchPortfolioConfig,
    configSchema: fetchPortfolioSchema,
    fieldSchema: STEP_FIELD_SCHEMAS.fetch_portfolio,
    summaryFn: (c) => {
      const config = c as FetchPortfolioConfig;
      const parts: string[] = [];
      if (config.include_open_orders) parts.push('+ orders');
      if (config.include_historical_positions) parts.push(`+ ${config.lookback_days ?? 30}d history`);
      return parts.join(' ') || 'current positions';
    },
  },

  evaluate_positions: {
    type: 'evaluate_positions',
    label: 'Evaluate Positions',
    icon: '\u2696\uFE0F',
    description: 'Assess current positions against risk thresholds and profit targets.',
    borderColor: '#d29922',
    defaultConfig: {
      risk_thresholds: { max_position_pct: 10, max_drawdown_pct: 5 },
      profit_targets: {},
      evaluate_against: 'entry_price',
    } as EvaluatePositionsConfig,
    configSchema: evaluatePositionsSchema,
    fieldSchema: STEP_FIELD_SCHEMAS.evaluate_positions,
    summaryFn: (c) => {
      const config = c as EvaluatePositionsConfig;
      return `max ${config.risk_thresholds.max_position_pct}% per position \u00B7 ${config.risk_thresholds.max_drawdown_pct}% max DD`;
    },
  },

  research: {
    type: 'research',
    label: 'Research',
    icon: '\u{1F4DA}',
    description: 'Deep research on specific assets, sectors, or the broad market.',
    borderColor: '#58a6ff',
    defaultConfig: {
      scope: 'market_wide',
      time_horizon: '1w',
      include_fundamentals: true,
      include_news: true,
      include_technicals: true,
    } as ResearchConfig,
    configSchema: researchSchema,
    fieldSchema: STEP_FIELD_SCHEMAS.research,
    summaryFn: (c) => {
      const config = c as ResearchConfig;
      return `${config.scope.replace('_', ' ')} \u00B7 ${config.time_horizon} horizon`;
    },
  },

  decide_actions: {
    type: 'decide_actions',
    label: 'Decide Actions',
    icon: '\u{1F9E0}',
    description: 'Formulate buy/sell/hold decisions based on gathered context.',
    borderColor: '#58a6ff',
    defaultConfig: {
      confidence_threshold: 60,
      max_trades_per_run: 5,
      max_position_size_pct: 10,
      allowed_actions: ['buy', 'sell', 'hold'],
      require_reasoning: true,
    } as DecideActionsConfig,
    configSchema: decideActionsSchema,
    fieldSchema: STEP_FIELD_SCHEMAS.decide_actions,
    summaryFn: (c) => {
      const config = c as DecideActionsConfig;
      return `confidence \u2265 ${config.confidence_threshold}% \u00B7 max ${config.max_trades_per_run} trades`;
    },
  },

  execute: {
    type: 'execute',
    label: 'Execute',
    icon: '\u26A1',
    description: 'Place trade orders via paper or live broker.',
    borderColor: '#f85149',
    defaultConfig: {
      approval_mode: 'human_approval',
      order_types_allowed: ['market', 'limit'],
      default_order_type: 'limit',
      limit_offset_bps: 10,
      dry_run_first: true,
    } as ExecuteConfig,
    configSchema: executeSchema,
    fieldSchema: STEP_FIELD_SCHEMAS.execute,
    summaryFn: (c) => {
      const config = c as ExecuteConfig;
      return `${config.approval_mode === 'auto' ? 'auto-execute' : 'human approval'} \u00B7 ${config.default_order_type}`;
    },
    maxInstances: 2,
    requiresTools: ['place_order'],
  },

  report: {
    type: 'report',
    label: 'Report',
    icon: '\u{1F4DD}',
    description: 'Generate a summary of analysis and actions.',
    borderColor: '#8b949e',
    defaultConfig: {
      format: 'brief',
      include_reasoning_chain: true,
      include_portfolio_snapshot: true,
      include_market_summary: false,
      delivery: 'store',
    } as ReportConfig,
    configSchema: reportSchema,
    fieldSchema: STEP_FIELD_SCHEMAS.report,
    summaryFn: (c) => {
      const config = c as ReportConfig;
      return `${config.format}${config.include_reasoning_chain ? ' \u00B7 with reasoning' : ''}`;
    },
  },

  condition: {
    type: 'condition',
    label: 'Condition',
    icon: '\u25C7',
    description: 'Branch the workflow based on a market or portfolio condition.',
    borderColor: '#d29922',
    defaultConfig: {
      condition_type: 'volatility_above',
      params: { threshold: 25 },
      true_label: 'Yes',
      false_label: 'No',
    } as ConditionConfig,
    configSchema: conditionSchema,
    fieldSchema: STEP_FIELD_SCHEMAS.condition,
    summaryFn: (c) => conditionSummary(c as ConditionConfig),
  },

  custom: {
    type: 'custom',
    label: 'Custom',
    icon: '\u2699\uFE0F',
    description: 'User-defined step with free-form instructions.',
    borderColor: '#8b949e',
    defaultConfig: {
      instruction: '',
      expected_output: 'text',
    } as CustomConfig,
    configSchema: customSchema,
    fieldSchema: STEP_FIELD_SCHEMAS.custom,
    summaryFn: (c) => {
      const config = c as CustomConfig;
      return config.instruction.slice(0, 60) + (config.instruction.length > 60 ? '...' : '') || 'no instruction set';
    },
  },
};

export const STEP_TYPES: StepType[] = [
  'analyze_market',
  'fetch_portfolio',
  'evaluate_positions',
  'research',
  'decide_actions',
  'execute',
  'report',
  'condition',
  'custom',
];
