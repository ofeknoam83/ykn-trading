// ─── Trade Forensics & Signal Debugger Types ───

import type { TradeRecord } from './backtest';

// ─── Indicator Types ───

export type IndicatorStatus = 'bullish' | 'bearish' | 'neutral' | 'warning';

export interface IndicatorSnapshot {
  name: string;
  value: number;
  interpretation: string;
  status: IndicatorStatus;
  detail?: string;
}

export interface IndicatorVote {
  indicator: string;
  value: number;
  vote: 'bullish' | 'bearish' | 'neutral';
  reason: string;
  agrees_with_signal: boolean;
}

// ─── Signal Types ───

export type SignalOutcome = 'executed' | 'filtered' | 'weak' | 'conflicted';

export interface SignalEvent {
  id: string;
  timestamp: string;
  symbol: string;
  direction: 'buy' | 'sell';
  outcome: SignalOutcome;
  trigger: {
    primary_indicator: string;
    description: string;
  };
  indicator_votes: IndicatorVote[];
  strength: number;
  required_strength: number;
  filter_reason?: string;
  conflict_detail?: string;
  hypothetical?: {
    return_5d: number;
    return_10d: number;
    return_20d: number;
    best_exit_return: number;
    best_exit_days: number;
  };
  trade_id?: string;
}

// ─── News Types ───

export interface NewsHeadline {
  title: string;
  source: string;
  url?: string;
  date: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

// ─── Trade Replay Types ───

export interface TradeReplayFrame {
  date: string;
  bar_index: number;
  ohlcv: { o: number; h: number; l: number; c: number; v: number };
  indicators: IndicatorSnapshot[];
  signals_fired: SignalEvent[];
  is_entry: boolean;
  is_exit: boolean;
  news?: NewsHeadline[];
}

export interface ChartDataPoint {
  date: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  indicators: Record<string, number>;
}

// ─── Enriched Trade Record ───

export interface EnrichedTradeRecord extends TradeRecord {
  entry_indicators: IndicatorSnapshot[];
  exit_indicators: IndicatorSnapshot[];
  entry_signal: SignalEvent;
  exit_signal: SignalEvent;
  timing: TimingMetrics;
  max_favorable_excursion: number;
  max_adverse_excursion: number;
  mfe_date: string;
  mae_date: string;
  chart_data: ChartDataPoint[];
  chart_window: { start: string; end: string };
  agent_forensics?: AgentDecisionForensics;
}

// ─── Timing Analysis Types ───

export interface TimingMetrics {
  trade_id: string;
  entry_date: string;
  entry_price: number;
  best_entry_price: number;
  best_entry_date: string;
  entry_efficiency: number;
  exit_date: string;
  exit_price: number;
  best_exit_price: number;
  best_exit_date: string;
  exit_efficiency: number;
  overall_efficiency: number;
  actual_return: number;
  optimal_return: number;
  captured_pct: number;
  max_favorable_excursion: number;
  max_adverse_excursion: number;
}

export type TimingInsightType =
  | 'entry_late'
  | 'entry_early'
  | 'exit_early'
  | 'exit_late'
  | 'stop_too_tight'
  | 'stop_too_loose';

export interface TimingInsight {
  type: TimingInsightType;
  severity: 'info' | 'suggestion' | 'strong_suggestion';
  message: string;
  evidence: string;
  recommendation: string;
  affected_trades: number;
}

// ─── Signal Contribution Types ───

export interface SignalContributionAnalysis {
  backtest_result_id: string;
  correlation_matrix: {
    indicators: string[];
    values: number[][];
  };
  individual_performance: {
    indicator: string;
    signal_count: number;
    trade_count: number;
    win_rate: number;
    avg_return: number;
    sharpe: number;
    unique_value: number;
  }[];
  ablation: {
    configuration: string;
    signals: number;
    trades: number;
    sharpe: number;
    delta_vs_full: number;
  }[];
  pair_synergies: {
    pair: [string, string];
    combined_sharpe: number;
    individual_avg_sharpe: number;
    synergy: number;
  }[];
  recommendations: {
    action: 'remove' | 'keep' | 'replace';
    target: string;
    reason: string;
    impact: string;
    confidence: 'high' | 'medium' | 'low';
  }[];
}

// ─── Signal Log Types ───

export interface BacktestSignalLog {
  backtest_result_id: string;
  signals: SignalEvent[];
  summary: {
    total: number;
    executed: number;
    filtered: number;
    weak: number;
    conflicted: number;
    filter_accuracy: number;
    missed_pnl: number;
  };
}

// ─── What-If Types ───

export interface WhatIfParams {
  backtest_result_id: string;
  trade_id: string;
  modifications: {
    entry_date?: string;
    entry_price?: number;
    exit_rule?: 'signal' | 'fixed_duration' | 'stop_loss' | 'take_profit' | 'stop_and_tp';
    stop_loss_pct?: number;
    take_profit_pct?: number;
    trailing_stop_pct?: number;
    fixed_duration_days?: number;
    indicator_overrides?: Record<string, unknown>;
    position_size?: number;
  };
  window_days: number;
}

export interface WhatIfOutcome {
  entry_date: string;
  entry_price: number;
  exit_date: string;
  exit_price: number;
  exit_reason: string;
  duration_days: number;
  pnl: number;
  pnl_pct: number;
  max_drawdown_pct: number;
  max_favorable_excursion_pct: number;
  equity_curve: { date: string; value: number }[];
}

export interface WhatIfResult {
  original: WhatIfOutcome;
  modified: WhatIfOutcome;
  comparison: {
    pnl_delta: number;
    pnl_pct_delta: number;
    verdict: 'better' | 'worse' | 'similar';
  };
}

export interface WhatIfScenario {
  id: string;
  label: string;
  params: WhatIfParams;
  result: WhatIfResult;
}

// ─── Agent Forensics Types ───

export interface AgentDecisionForensics {
  decision_id: string;
  timestamp: string;
  action: 'buy' | 'sell' | 'hold';
  symbol?: string;
  quantity?: number;
  price?: number;
  confidence: number;
  tool_calls: {
    tool: string;
    args: Record<string, unknown>;
    result_summary: string;
    latency_ms: number;
  }[];
  available_tools_not_used: string[];
  reasoning_chain: {
    step: number;
    title: string;
    content: string;
  }[];
  alternatives_considered: {
    action: string;
    reason_rejected: string;
  }[];
  benchmark_rules: {
    rule_name: string;
    signal_on_date: boolean;
    hypothetical_return?: number;
  }[];
  outcome?: {
    exit_date: string;
    exit_price: number;
    pnl: number;
    pnl_pct: number;
  };
}

export interface AgentAlphaAnalysis {
  total_decisions: number;
  total_trades: number;
  total_holds: number;
  trade_win_rate: number;
  avg_return_per_trade: number;
  agent_sharpe: number;
  baselines: {
    rule_name: string;
    sharpe: number;
    delta_vs_agent: number;
  }[];
  alpha_decomposition: {
    total_alpha: number;
    sources: {
      source: string;
      contribution: number;
      detail: string;
    }[];
  };
  cost_analysis: {
    llm_cost_total: number;
    alpha_value: number;
    net_value: number;
  };
  hold_decisions: {
    decision_id: string;
    timestamp: string;
    confidence: number;
    reasoning_summary: string;
    hypothetical_best_trade_return?: number;
    was_correct: boolean;
  }[];
}
