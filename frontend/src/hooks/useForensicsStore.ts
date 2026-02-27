import { create } from 'zustand';
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
import type { AgentDecisionForensics, NewsHeadline } from '../types/forensics';
import {
  getTradeReplay,
  getSignalLog,
  getSignalSummary,
  getTimingAnalysis,
  getTimingInsights,
  getSignalContribution,
  getAgentAlpha,
  getAgentForensics,
  getTradeNews,
  runWhatIf as apiRunWhatIf,
} from '../api/forensicsApi';

const MAX_WHATIF_HISTORY = 20;

export interface ForensicsStore {
  backtestResult: BacktestResult | null;
  selectedTradeId: string | null;
  enrichedTrades: Record<string, EnrichedTradeRecord>;
  signalLog: BacktestSignalLog | null;
  signalSummary: BacktestSignalLog['summary'] | null;
  timingAnalysis: TimingMetrics[] | null;
  timingInsights: TimingInsight[] | null;
  signalContribution: SignalContributionAnalysis | null;
  agentAlpha: AgentAlphaAnalysis | null;
  agentForensics: Record<string, AgentDecisionForensics>;
  tradeNews: Record<string, { entry_news: NewsHeadline[]; exit_news: NewsHeadline[] }>;
  whatIfHistory: WhatIfScenario[];
  loading: {
    trades: boolean;
    signals: boolean;
    timing: boolean;
    contribution: boolean;
    agentAlpha: boolean;
  };
  errors: Record<string, string | null>;

  setResult: (result: BacktestResult) => void;
  selectTrade: (tradeId: string | null) => void;
  loadTradeReplay: (tradeId: string) => Promise<EnrichedTradeRecord | null>;
  loadSignalLog: () => Promise<void>;
  loadSignalSummary: () => Promise<void>;
  loadTimingAnalysis: () => Promise<void>;
  loadSignalContribution: () => Promise<void>;
  loadAgentAlpha: () => Promise<void>;
  loadAgentForensics: (tradeId: string) => Promise<AgentDecisionForensics | null>;
  loadTradeNews: (tradeId: string) => Promise<{ entry_news: NewsHeadline[]; exit_news: NewsHeadline[] } | null>;
  executeWhatIf: (params: WhatIfParams) => Promise<WhatIfResult | null>;
  clearWhatIfHistory: () => void;
}

export const useForensicsStore = create<ForensicsStore>((set, get) => ({
  backtestResult: null,
  selectedTradeId: null,
  enrichedTrades: {},
  signalLog: null,
  signalSummary: null,
  timingAnalysis: null,
  timingInsights: null,
  signalContribution: null,
  agentAlpha: null,
  agentForensics: {},
  tradeNews: {},
  whatIfHistory: [],
  loading: {
    trades: false,
    signals: false,
    timing: false,
    contribution: false,
    agentAlpha: false,
  },
  errors: {},

  setResult: (result) =>
    set({
      backtestResult: result,
      selectedTradeId: null,
      enrichedTrades: {},
      signalLog: null,
      signalSummary: null,
      timingAnalysis: null,
      timingInsights: null,
      signalContribution: null,
      agentAlpha: null,
      agentForensics: {},
      tradeNews: {},
      whatIfHistory: [],
      errors: {},
    }),

  selectTrade: (tradeId) => set({ selectedTradeId: tradeId }),

  loadTradeReplay: async (tradeId) => {
    const { backtestResult, enrichedTrades } = get();
    if (!backtestResult) return null;
    if (enrichedTrades[tradeId]) return enrichedTrades[tradeId];

    set((state) => ({
      loading: { ...state.loading, trades: true },
      errors: { ...state.errors, tradeReplay: null },
    }));
    try {
      const data = await getTradeReplay(backtestResult.id, tradeId);
      set((state) => ({
        enrichedTrades: { ...state.enrichedTrades, [tradeId]: data },
      }));
      return data;
    } catch (err) {
      set((state) => ({
        errors: {
          ...state.errors,
          tradeReplay: err instanceof Error ? err.message : 'Failed to load trade replay',
        },
      }));
      return null;
    } finally {
      set((state) => ({ loading: { ...state.loading, trades: false } }));
    }
  },

  loadSignalLog: async () => {
    const { backtestResult, signalLog } = get();
    if (!backtestResult || signalLog) return;
    set((state) => ({
      loading: { ...state.loading, signals: true },
      errors: { ...state.errors, signals: null },
    }));
    try {
      const data = await getSignalLog(backtestResult.id);
      set({ signalLog: data });
    } catch (err) {
      set((state) => ({
        errors: {
          ...state.errors,
          signals: err instanceof Error ? err.message : 'Failed to load signals',
        },
      }));
    } finally {
      set((state) => ({ loading: { ...state.loading, signals: false } }));
    }
  },

  loadTimingAnalysis: async () => {
    const { backtestResult, timingAnalysis } = get();
    if (!backtestResult || timingAnalysis) return;
    set((state) => ({
      loading: { ...state.loading, timing: true },
      errors: { ...state.errors, timing: null },
    }));
    try {
      const [metrics, insights] = await Promise.all([
        getTimingAnalysis(backtestResult.id),
        getTimingInsights(backtestResult.id),
      ]);
      set({ timingAnalysis: metrics, timingInsights: insights });
    } catch (err) {
      set((state) => ({
        errors: {
          ...state.errors,
          timing: err instanceof Error ? err.message : 'Failed to load timing',
        },
      }));
    } finally {
      set((state) => ({ loading: { ...state.loading, timing: false } }));
    }
  },

  loadSignalContribution: async () => {
    const { backtestResult, signalContribution } = get();
    if (!backtestResult || signalContribution) return;
    set((state) => ({
      loading: { ...state.loading, contribution: true },
      errors: { ...state.errors, contribution: null },
    }));
    try {
      const data = await getSignalContribution(backtestResult.id);
      set({ signalContribution: data });
    } catch (err) {
      set((state) => ({
        errors: {
          ...state.errors,
          contribution:
            err instanceof Error ? err.message : 'Failed to load signal contribution',
        },
      }));
    } finally {
      set((state) => ({ loading: { ...state.loading, contribution: false } }));
    }
  },

  loadAgentAlpha: async () => {
    const { backtestResult, agentAlpha } = get();
    if (!backtestResult || agentAlpha) return;
    set((state) => ({
      loading: { ...state.loading, agentAlpha: true },
      errors: { ...state.errors, agentAlpha: null },
    }));
    try {
      const data = await getAgentAlpha(backtestResult.id);
      set({ agentAlpha: data });
    } catch (err) {
      set((state) => ({
        errors: {
          ...state.errors,
          agentAlpha:
            err instanceof Error ? err.message : 'Failed to load agent alpha',
        },
      }));
    } finally {
      set((state) => ({ loading: { ...state.loading, agentAlpha: false } }));
    }
  },

  loadSignalSummary: async () => {
    const { backtestResult, signalSummary } = get();
    if (!backtestResult || signalSummary) return;
    try {
      const data = await getSignalSummary(backtestResult.id);
      set({ signalSummary: data });
    } catch (err) {
      set((state) => ({
        errors: {
          ...state.errors,
          signalSummary: err instanceof Error ? err.message : 'Failed to load signal summary',
        },
      }));
    }
  },

  loadAgentForensics: async (tradeId) => {
    const { backtestResult, agentForensics } = get();
    if (!backtestResult) return null;
    if (agentForensics[tradeId]) return agentForensics[tradeId];
    try {
      const data = await getAgentForensics(backtestResult.id, tradeId);
      set((state) => ({
        agentForensics: { ...state.agentForensics, [tradeId]: data },
      }));
      return data;
    } catch (err) {
      set((state) => ({
        errors: {
          ...state.errors,
          agentForensics: err instanceof Error ? err.message : 'Failed to load agent forensics',
        },
      }));
      return null;
    }
  },

  loadTradeNews: async (tradeId) => {
    const { backtestResult, tradeNews } = get();
    if (!backtestResult) return null;
    if (tradeNews[tradeId]) return tradeNews[tradeId];
    try {
      const data = await getTradeNews(backtestResult.id, tradeId);
      set((state) => ({
        tradeNews: { ...state.tradeNews, [tradeId]: data },
      }));
      return data;
    } catch (err) {
      set((state) => ({
        errors: {
          ...state.errors,
          tradeNews: err instanceof Error ? err.message : 'Failed to load trade news',
        },
      }));
      return null;
    }
  },

  executeWhatIf: async (params) => {
    try {
      const result = await apiRunWhatIf(params);
      const scenario: WhatIfScenario = {
        id: `whatif-${Date.now()}`,
        label: buildWhatIfLabel(params),
        params,
        result,
      };
      set((state) => ({
        whatIfHistory: [scenario, ...state.whatIfHistory].slice(0, MAX_WHATIF_HISTORY),
      }));
      return result;
    } catch {
      return null;
    }
  },

  clearWhatIfHistory: () => set({ whatIfHistory: [] }),
}));

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
