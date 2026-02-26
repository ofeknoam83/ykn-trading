import { useState, useCallback } from 'react';
import type {
  EnrichedTradeRecord,
  BacktestSignalLog,
  TimingMetrics,
  TimingInsight,
  SignalContributionAnalysis,
  AgentAlphaAnalysis,
  WhatIfParams,
  WhatIfResult,
  WhatIfScenario,
} from '../types/forensics';
import type { BacktestResult } from '../types/backtest';
import {
  getTradeReplay,
  getSignalLog,
  getTimingAnalysis,
  getTimingInsights,
  getSignalContribution,
  getAgentAlpha,
  runWhatIf as apiRunWhatIf,
} from '../api/forensicsApi';

const MAX_WHATIF_HISTORY = 20;

export function useForensicsStore() {
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);

  // Loaded data
  const [enrichedTrades, setEnrichedTrades] = useState<
    Record<string, EnrichedTradeRecord>
  >({});
  const [signalLog, setSignalLog] = useState<BacktestSignalLog | null>(null);
  const [timingAnalysis, setTimingAnalysis] = useState<TimingMetrics[] | null>(null);
  const [timingInsights, setTimingInsights] = useState<TimingInsight[] | null>(null);
  const [signalContribution, setSignalContribution] =
    useState<SignalContributionAnalysis | null>(null);
  const [agentAlpha, setAgentAlpha] = useState<AgentAlphaAnalysis | null>(null);

  // What-if session
  const [whatIfHistory, setWhatIfHistory] = useState<WhatIfScenario[]>([]);

  // Loading states
  const [loading, setLoading] = useState({
    trades: false,
    signals: false,
    timing: false,
    contribution: false,
    agentAlpha: false,
  });

  // Error states
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const setResult = useCallback((result: BacktestResult) => {
    setBacktestResult(result);
    setSelectedTradeId(null);
    setEnrichedTrades({});
    setSignalLog(null);
    setTimingAnalysis(null);
    setTimingInsights(null);
    setSignalContribution(null);
    setAgentAlpha(null);
    setWhatIfHistory([]);
    setErrors({});
  }, []);

  const selectTrade = useCallback((tradeId: string | null) => {
    setSelectedTradeId(tradeId);
  }, []);

  const loadTradeReplay = useCallback(
    async (tradeId: string) => {
      if (!backtestResult) return null;
      if (enrichedTrades[tradeId]) return enrichedTrades[tradeId];

      setLoading((prev) => ({ ...prev, trades: true }));
      setErrors((prev) => ({ ...prev, tradeReplay: null }));
      try {
        const data = await getTradeReplay(backtestResult.id, tradeId);
        setEnrichedTrades((prev) => ({ ...prev, [tradeId]: data }));
        return data;
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          tradeReplay: err instanceof Error ? err.message : 'Failed to load trade replay',
        }));
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, trades: false }));
      }
    },
    [backtestResult, enrichedTrades]
  );

  const loadSignalLog = useCallback(async () => {
    if (!backtestResult || signalLog) return;
    setLoading((prev) => ({ ...prev, signals: true }));
    setErrors((prev) => ({ ...prev, signals: null }));
    try {
      const data = await getSignalLog(backtestResult.id);
      setSignalLog(data);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        signals: err instanceof Error ? err.message : 'Failed to load signals',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, signals: false }));
    }
  }, [backtestResult, signalLog]);

  const loadTimingAnalysis = useCallback(async () => {
    if (!backtestResult || timingAnalysis) return;
    setLoading((prev) => ({ ...prev, timing: true }));
    setErrors((prev) => ({ ...prev, timing: null }));
    try {
      const [metrics, insights] = await Promise.all([
        getTimingAnalysis(backtestResult.id),
        getTimingInsights(backtestResult.id),
      ]);
      setTimingAnalysis(metrics);
      setTimingInsights(insights);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        timing: err instanceof Error ? err.message : 'Failed to load timing',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, timing: false }));
    }
  }, [backtestResult, timingAnalysis]);

  const loadSignalContribution = useCallback(async () => {
    if (!backtestResult || signalContribution) return;
    setLoading((prev) => ({ ...prev, contribution: true }));
    setErrors((prev) => ({ ...prev, contribution: null }));
    try {
      const data = await getSignalContribution(backtestResult.id);
      setSignalContribution(data);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        contribution:
          err instanceof Error ? err.message : 'Failed to load signal contribution',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, contribution: false }));
    }
  }, [backtestResult, signalContribution]);

  const loadAgentAlpha = useCallback(async () => {
    if (!backtestResult || agentAlpha) return;
    setLoading((prev) => ({ ...prev, agentAlpha: true }));
    setErrors((prev) => ({ ...prev, agentAlpha: null }));
    try {
      const data = await getAgentAlpha(backtestResult.id);
      setAgentAlpha(data);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        agentAlpha:
          err instanceof Error ? err.message : 'Failed to load agent alpha',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, agentAlpha: false }));
    }
  }, [backtestResult, agentAlpha]);

  const executeWhatIf = useCallback(
    async (params: WhatIfParams): Promise<WhatIfResult | null> => {
      try {
        const result = await apiRunWhatIf(params);
        const scenario: WhatIfScenario = {
          id: `whatif-${Date.now()}`,
          label: buildWhatIfLabel(params),
          params,
          result,
        };
        setWhatIfHistory((prev) => {
          const next = [scenario, ...prev];
          return next.slice(0, MAX_WHATIF_HISTORY);
        });
        return result;
      } catch {
        return null;
      }
    },
    []
  );

  const clearWhatIfHistory = useCallback(() => {
    setWhatIfHistory([]);
  }, []);

  return {
    backtestResult,
    selectedTradeId,
    enrichedTrades,
    signalLog,
    timingAnalysis,
    timingInsights,
    signalContribution,
    agentAlpha,
    whatIfHistory,
    loading,
    errors,
    setResult,
    selectTrade,
    loadTradeReplay,
    loadSignalLog,
    loadTimingAnalysis,
    loadSignalContribution,
    loadAgentAlpha,
    executeWhatIf,
    clearWhatIfHistory,
  };
}

function buildWhatIfLabel(params: WhatIfParams): string {
  const mods = params.modifications;
  const parts: string[] = [];
  if (mods.entry_date) parts.push(`Entry ${mods.entry_date}`);
  if (mods.stop_loss_pct) parts.push(`SL ${mods.stop_loss_pct}%`);
  if (mods.take_profit_pct) parts.push(`TP ${mods.take_profit_pct}%`);
  if (mods.trailing_stop_pct) parts.push(`Trail ${mods.trailing_stop_pct}%`);
  if (mods.exit_rule && mods.exit_rule !== 'signal') parts.push(`Exit: ${mods.exit_rule}`);
  if (mods.indicator_overrides && Object.keys(mods.indicator_overrides).length > 0) {
    parts.push('Modified indicators');
  }
  if (mods.position_size) parts.push(`Size: ${mods.position_size}`);
  return parts.length > 0 ? parts.join(', ') : 'Custom scenario';
}

export type ForensicsStore = ReturnType<typeof useForensicsStore>;
