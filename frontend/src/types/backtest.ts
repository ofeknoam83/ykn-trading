// ─── Core Backtest Types ─── §12 Data Model

export type RegimeType =
  | 'bull_low_vol'
  | 'bull_high_vol'
  | 'bear_low_vol'
  | 'bear_high_vol'
  | 'sideways'
  | 'crisis';

export interface TimeSeriesPoint {
  date: string;
  strategy_value: number;
  benchmark_value: number;
  drawdown_pct: number;
}

export interface TradeRecord {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  pnl_pct: number;
  duration_days: number;
  fees: number;
}

export interface BacktestMetrics {
  total_return: number;
  annualized_return: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  calmar_ratio: number;
  max_drawdown: number;
  max_drawdown_duration_days: number;
  profit_factor: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  total_trades: number;
  best_trade: number;
  worst_trade: number;
  avg_trade_duration_days: number;
  volatility_annualized: number;
  beta: number;
  alpha: number;
  information_ratio: number;
  skewness: number;
  kurtosis: number;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  return_pct: number;
}

export interface DrawdownPoint {
  date: string;
  drawdown_pct: number;
  underwater_days: number;
}

export interface DrawdownPeriod {
  start_date: string;
  bottom_date: string;
  recovery_date: string | null;
  depth_pct: number;
  duration_days: number;
  recovery_days: number | null;
}

export interface RegimeTag {
  date: string;
  regime: RegimeType;
}

export interface RegimePerformance {
  regime: RegimeType;
  days: number;
  pct_of_time: number;
  total_return: number;
  annualized_return: number;
  sharpe: number;
  max_drawdown: number;
  win_rate: number;
  trade_count: number;
}

export interface RegimeTransition {
  from: RegimeType;
  to: RegimeType;
  frequency: number;
  avg_return_5d: number;
  avg_return_20d: number;
}

export interface RegimeAnalysis {
  regimes: RegimeTag[];
  regime_performance: RegimePerformance[];
  regime_transitions: RegimeTransition[];
}

export interface RollingPoint {
  date: string;
  sharpe: number;
  return_annualized: number;
  volatility_annualized: number;
  beta: number;
}

export interface RollingMetrics {
  window_days: number;
  points: RollingPoint[];
}

export interface ReturnDistribution {
  daily_returns: number[];
  histogram: { bin_start: number; bin_end: number; count: number }[];
  qq_theoretical: number[];
  qq_actual: number[];
  best_days: { date: string; return_pct: number }[];
  worst_days: { date: string; return_pct: number }[];
}

export interface MonteCarloResult {
  method: string;
  simulations: number;
  confidence_level: number;
  percentile_curves: {
    percentile: number;
    values: number[];
  }[];
  terminal_returns: number[];
  max_drawdowns: number[];
  sharpe_ratios: number[];
  summary: {
    metric: string;
    actual: number;
    median: number;
    pct_5: number;
    pct_95: number;
    actual_percentile: number;
  }[];
  pct_positive_sharpe: number;
  pct_beats_benchmark: number;
  probability_of_loss: number;
}

// ─── Config Types ───

export interface BacktestConfig {
  strategy_id?: string;
  strategy_type: string;
  strategy_config: Record<string, unknown>;
  assets: string[];
  date_range: { start: string; end: string };
  interval: string;
  benchmark: string;
  fees: { maker_bps: number; taker_bps: number };
}

// ─── Result Types ───

export interface BacktestResult {
  id: string;
  name: string;
  created_at: string;
  status: 'completed' | 'failed';
  config: BacktestConfig;
  equity_curve: TimeSeriesPoint[];
  trades: TradeRecord[];
  metrics: BacktestMetrics;
  monthly_returns: MonthlyReturn[];
  drawdown_series: DrawdownPoint[];
  top_drawdowns: DrawdownPeriod[];
  regime_analysis?: RegimeAnalysis;
  rolling_metrics?: RollingMetrics;
  return_distribution?: ReturnDistribution;
  monte_carlo?: MonteCarloResult;
}

// ─── Optimizer Types ───

export interface OptimizationParameter {
  key: string;
  label: string;
  type: 'range' | 'enum';
  from?: number;
  to?: number;
  step?: number;
  values?: (string | number)[];
}

export interface OptimizerGridCell {
  param_values: Record<string, string | number>;
  metrics: BacktestMetrics;
  result_id: string;
}

export interface OptimizerResult {
  id: string;
  target_metric: string;
  parameters: OptimizationParameter[];
  grid: OptimizerGridCell[];
  top_n: OptimizerGridCell[];
  total_combinations: number;
  completed_combinations: number;
}

// ─── Walk-Forward Types ───

export interface WalkForwardWindow {
  window_number: number;
  is_start: string;
  is_end: string;
  oos_start: string;
  oos_end: string;
  is_metrics: BacktestMetrics;
  oos_metrics: BacktestMetrics;
  params_used?: Record<string, unknown>;
  oos_result_id: string;
}

export interface StabilityComponent {
  name: string;
  value: number;
  weight: number;
  status: 'pass' | 'warn' | 'fail';
}

export interface WalkForwardResult {
  id: string;
  window_type: 'rolling' | 'expanding';
  windows: WalkForwardWindow[];
  combined_oos_equity: TimeSeriesPoint[];
  combined_oos_metrics: BacktestMetrics;
  stability_score: number;
  stability_components: StabilityComponent[];
}

// ─── Library Types ───

export interface LibraryEntry {
  id: string;
  name: string;
  notes?: string;
  tags: string[];
  created_at: string;
  config: BacktestConfig;
  summary_metrics: {
    total_return: number;
    annualized_return: number;
    sharpe: number;
    sortino: number;
    calmar: number;
    max_drawdown: number;
    win_rate: number;
    profit_factor: number;
    total_trades: number;
  };
  analysis: {
    has_regime_analysis: boolean;
    has_monte_carlo: boolean;
    has_walk_forward: boolean;
    walk_forward_stability?: number;
    monte_carlo_significance?: number;
  };
  result_id: string;
}

export interface LibraryFilters {
  q?: string;
  type?: string;
  sort?: 'recent' | 'sharpe' | 'return' | 'max_dd' | 'name';
  sharpe_min?: number;
  tag?: string;
  page?: number;
  per_page?: number;
}

// ─── Job Progress Types ───

export interface OptimizerJobProgress {
  status: string;
  progress: number;
  eta_seconds: number;
  details: {
    completed: number;
    total: number;
    current_params: Record<string, unknown>;
  };
  partial_results: OptimizerGridCell[];
}

export interface WalkForwardJobProgress {
  status: string;
  progress: number;
  eta_seconds: number;
  details: {
    completed_windows: number;
    total_windows: number;
    current_window: { is_period: string; oos_period: string };
  };
}

export interface MonteCarloJobProgress {
  status: string;
  progress: number;
  eta_seconds: number;
  details: {
    completed_simulations: number;
    total_simulations: number;
  };
}

// ─── Metric keys for optimization target ───

export const OPTIMIZATION_METRICS = [
  { key: 'sharpe_ratio', label: 'Sharpe Ratio', description: 'Risk-adjusted return' },
  { key: 'sortino_ratio', label: 'Sortino Ratio', description: 'Downside-deviation adjusted return' },
  { key: 'calmar_ratio', label: 'Calmar Ratio', description: 'Return / max drawdown' },
  { key: 'total_return', label: 'Total Return', description: 'Raw cumulative return' },
  { key: 'max_drawdown', label: 'Max Drawdown', description: 'Minimize maximum drawdown (inverted)' },
  { key: 'profit_factor', label: 'Profit Factor', description: 'Gross profit / gross loss' },
  { key: 'win_rate', label: 'Win Rate', description: 'Percentage of profitable trades' },
] as const;

// ─── Regime display config ───

export const REGIME_CONFIG: Record<RegimeType, { label: string; color: string; bgColor: string }> = {
  bull_low_vol: { label: 'Bull (Low Vol)', color: '#3fb950', bgColor: 'rgba(63,185,80,0.1)' },
  bull_high_vol: { label: 'Bull (High Vol)', color: '#9be9a8', bgColor: 'rgba(155,233,168,0.1)' },
  bear_low_vol: { label: 'Bear (Low Vol)', color: '#d29922', bgColor: 'rgba(210,153,34,0.1)' },
  bear_high_vol: { label: 'Bear (High Vol)', color: '#f85149', bgColor: 'rgba(248,81,73,0.1)' },
  sideways: { label: 'Sideways', color: '#8b949e', bgColor: 'rgba(139,148,158,0.1)' },
  crisis: { label: 'Crisis', color: '#6e40c9', bgColor: 'rgba(110,64,201,0.1)' },
};
