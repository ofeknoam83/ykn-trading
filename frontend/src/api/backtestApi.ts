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

export async function runBacktestEnhanced(config: BacktestConfig): Promise<{ job_id: string }> {
  const { data } = await api.post('/backtest/run', config);
  return data;
}

export async function getBacktestResult(id: string): Promise<BacktestResult> {
  const { data } = await api.get(`/backtest/results/${id}`);
  return data;
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
  const { data } = await api.get('/backtest/results/pinned');
  return data;
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
