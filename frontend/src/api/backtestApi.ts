import { api } from './client';
import type {
  BacktestConfig,
  BacktestResult,
  OptimizerResult,
  OptimizationParameter,
  WalkForwardResult,
  MonteCarloResult,
  LibraryEntry,
  LibraryFilters,
} from '../types/backtest';

// ─── Single Backtest ───

/** Map BacktestConfig to backend BacktestRequest format (symbol, start, end, etc.) */
function toBacktestRequest(config: BacktestConfig) {
  const symbol = config.assets?.[0] ?? 'SPY';
  return {
    symbol,
    start: config.date_range.start,
    end: config.date_range.end,
    interval: config.interval ?? '1d',
    maker_fee_bps: config.fees?.maker_bps ?? 0,
    taker_fee_bps: config.fees?.taker_bps ?? 0,
    benchmark: config.benchmark || null,
    fast_period: (config.strategy_config?.fast_period as number) ?? 10,
    slow_period: (config.strategy_config?.slow_period as number) ?? 30,
  };
}

export async function runBacktestEnhanced(config: BacktestConfig): Promise<{ job_id: string }> {
  const body = toBacktestRequest(config);
  const { data } = await api.post('/backtest/run', body);
  return data;
}

/** Fetch backtest result by job id. Backend stores result in job; returns raw shape. */
export async function getBacktestResult(jobId: string): Promise<BacktestResult> {
  const { data } = await api.get(`/backtest/${jobId}`);
  if (data?.status !== 'completed' || !data?.result) {
    throw new Error(data?.error ?? 'Backtest not ready');
  }
  return normalizeJobResult(data.result, jobId);
}

export function normalizeJobResult(
  raw: {
    symbol?: string;
    benchmark?: string;
    metrics?: Record<string, number>;
    equity_curve?: Record<string, number>;
    benchmark_curve?: Record<string, number>;
    trades_count?: number;
    trades?: Array<{
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
    }>;
  },
  id: string
): BacktestResult {
  const strategyCurve = raw.equity_curve ?? {};
  const benchmarkCurve = raw.benchmark_curve ?? {};
  const equitySeries = Object.keys(strategyCurve)
    .map((dateKey) => ({
      date: String(dateKey).slice(0, 10),
      strategy_value: strategyCurve[dateKey],
      benchmark_value: benchmarkCurve[dateKey] ?? strategyCurve[dateKey],
      drawdown_pct: 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const m = raw.metrics ?? {};
  return {
    id,
    name: `${raw.symbol ?? 'Backtest'} ${new Date().toLocaleDateString()}`,
    created_at: new Date().toISOString(),
    status: 'completed',
    config: {
      strategy_type: 'sma_crossover',
      strategy_config: {},
      assets: [raw.symbol ?? 'SPY'],
      date_range: { start: '', end: '' },
      interval: '1d',
      benchmark: raw.benchmark ?? 'SPY',
      fees: { maker_bps: 0, taker_bps: 0 },
    },
    equity_curve: equitySeries,
    trades: Array.isArray(raw.trades) ? raw.trades : [],
    metrics: {
      total_return: m.total_return ?? 0,
      annualized_return: m.annualized_return ?? 0,
      sharpe_ratio: m.sharpe_ratio ?? 0,
      sortino_ratio: m.sortino_ratio ?? 0,
      calmar_ratio: m.calmar_ratio ?? 0,
      max_drawdown: m.max_drawdown ?? 0,
      max_drawdown_duration_days: m.max_drawdown_duration_days ?? 0,
      profit_factor: m.profit_factor ?? 0,
      win_rate: m.win_rate ?? 0,
      avg_win: m.avg_win ?? 0,
      avg_loss: m.avg_loss ?? 0,
      total_trades: m.total_trades ?? raw.trades_count ?? 0,
      best_trade: m.best_trade ?? 0,
      worst_trade: m.worst_trade ?? 0,
      avg_trade_duration_days: m.avg_trade_duration_days ?? 0,
      volatility_annualized: m.volatility_annualized ?? 0,
      beta: m.beta ?? 0,
      alpha: m.alpha ?? 0,
      information_ratio: m.information_ratio ?? 0,
      skewness: m.skewness ?? 0,
      kurtosis: m.kurtosis ?? 0,
    },
    monthly_returns: [],
    drawdown_series: [],
    top_drawdowns: [],
  };
}

export async function getBacktestTrades(id: string, page = 1, perPage = 50) {
  const { data } = await api.get(`/backtest/results/${id}/trades`, {
    params: { page, per_page: perPage },
  });
  return data;
}

// ─── Pinning ───

export async function pinResult(id: string): Promise<void> {
  await api.post(`/backtest/results/${id}/pin`);
}

export async function unpinResult(id: string): Promise<void> {
  await api.delete(`/backtest/results/${id}/pin`);
}

export async function getPinnedResults(): Promise<BacktestResult[]> {
  try {
    const { data } = await api.get('/backtest/results/pinned');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ─── Optimizer ───

export async function runOptimizer(config: {
  strategy_id?: string;
  strategy_config_overrides: Record<string, unknown>;
  assets: string[];
  date_range: { start: string; end: string };
  interval: string;
  benchmark: string;
  fees: { maker_bps: number; taker_bps: number };
  optimization: {
    target_metric: string;
    parameters: OptimizationParameter[];
  };
}): Promise<{ job_id: string }> {
  const { data } = await api.post('/backtest/optimize', config);
  return data;
}

// ─── Walk-Forward ───

export async function runWalkForward(config: {
  strategy_id?: string;
  strategy_config: Record<string, unknown>;
  assets: string[];
  date_range: { start: string; end: string };
  interval: string;
  benchmark: string;
  fees: { maker_bps: number; taker_bps: number };
  walk_forward: {
    window_type: 'rolling' | 'expanding';
    in_sample_days: number;
    out_of_sample_days: number;
    step_days: number;
    re_optimize: boolean;
    optimization_config?: {
      target_metric: string;
      parameters: OptimizationParameter[];
    };
  };
}): Promise<{ job_id: string }> {
  const { data } = await api.post('/backtest/walk-forward', config);
  return data;
}

// ─── Monte Carlo ───

export async function runMonteCarlo(config: {
  backtest_result_id: string;
  method: 'trade_resample' | 'return_shuffle' | 'block_bootstrap';
  simulations: number;
  confidence_level: number;
  block_size?: number;
}): Promise<{ job_id: string }> {
  const { data } = await api.post('/backtest/monte-carlo', config);
  return data;
}

// ─── Library ───

export async function saveToLibrary(entry: {
  result_id: string;
  name: string;
  notes?: string;
  tags?: string[];
}): Promise<LibraryEntry> {
  const { data } = await api.post('/backtest/library', entry);
  return data;
}

export async function getLibrary(filters: LibraryFilters): Promise<{
  entries: LibraryEntry[];
  total: number;
}> {
  const { data } = await api.get('/backtest/library', { params: filters });
  return data;
}

export async function updateLibraryEntry(
  id: string,
  update: { name?: string; notes?: string; tags?: string[] }
): Promise<LibraryEntry> {
  const { data } = await api.put(`/backtest/library/${id}`, update);
  return data;
}

export async function deleteLibraryEntry(id: string): Promise<void> {
  await api.delete(`/backtest/library/${id}`);
}

// ─── Helper: get typed job result ───

export function parseOptimizerResult(result: unknown): OptimizerResult {
  return result as OptimizerResult;
}

export function parseWalkForwardResult(result: unknown): WalkForwardResult {
  return result as WalkForwardResult;
}

export function parseMonteCarloResult(result: unknown): MonteCarloResult {
  return result as MonteCarloResult;
}
