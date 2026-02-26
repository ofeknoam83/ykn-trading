import { api } from './client';
import type {
  EnrichedTradeRecord,
  BacktestSignalLog,
  WhatIfParams,
  WhatIfResult,
  TimingMetrics,
  TimingInsight,
  SignalContributionAnalysis,
  AgentDecisionForensics,
  AgentAlphaAnalysis,
} from '../types/forensics';

// ─── Trade Replay ───

export async function getTradeReplay(
  resultId: string,
  tradeId: string
): Promise<EnrichedTradeRecord> {
  const { data } = await api.get(
    `/backtest/results/${resultId}/trades/${tradeId}/replay`
  );
  return data;
}

// ─── Signal Log ───

export async function getSignalLog(resultId: string): Promise<BacktestSignalLog> {
  const { data } = await api.get(`/backtest/results/${resultId}/signals`);
  return data;
}

export async function getSignalSummary(
  resultId: string
): Promise<BacktestSignalLog['summary']> {
  const { data } = await api.get(`/backtest/results/${resultId}/signals/summary`);
  return data;
}

// ─── What-If Simulator ───

export async function runWhatIf(params: WhatIfParams): Promise<WhatIfResult> {
  const { data } = await api.post('/backtest/what-if', params);
  return data;
}

// ─── Timing Analysis ───

export async function getTimingAnalysis(resultId: string): Promise<TimingMetrics[]> {
  const { data } = await api.get(`/backtest/results/${resultId}/timing`);
  return data;
}

export async function getTimingInsights(resultId: string): Promise<TimingInsight[]> {
  const { data } = await api.get(`/backtest/results/${resultId}/timing/insights`);
  return data;
}

// ─── Signal Contribution ───

export async function getSignalContribution(
  resultId: string
): Promise<SignalContributionAnalysis> {
  const { data } = await api.get(
    `/backtest/results/${resultId}/signals/contribution`
  );
  return data;
}

// ─── Agent Forensics ───

export async function getAgentForensics(
  resultId: string,
  tradeId: string
): Promise<AgentDecisionForensics> {
  const { data } = await api.get(
    `/backtest/results/${resultId}/trades/${tradeId}/agent-forensics`
  );
  return data;
}

export async function getAgentAlpha(resultId: string): Promise<AgentAlphaAnalysis> {
  const { data } = await api.get(`/backtest/results/${resultId}/agent-alpha`);
  return data;
}

// ─── Trade News ───

export async function getTradeNews(
  resultId: string,
  tradeId: string
): Promise<{ entry_news: import('../types/forensics').NewsHeadline[]; exit_news: import('../types/forensics').NewsHeadline[] }> {
  const { data } = await api.get(
    `/backtest/results/${resultId}/trades/${tradeId}/news`
  );
  return data;
}
