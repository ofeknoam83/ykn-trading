import { create } from 'zustand';
import type {
  ScanDefinition,
  ScanResult,
  Anomaly,
  AnomalyConfig,
  ScanAlert,
  ScanSummaryCard,
  MarketOverview,
  PipelineAction,
  QuickBacktestResult,
  HeatmapCell,
} from '../types/scanner.types';

interface ScannerStore {
  // ─── Active Scan ───
  activeScan: ScanDefinition | null;
  scanStatus: 'idle' | 'running' | 'paused' | 'error';

  // ─── Results ───
  results: ScanResult[];
  resultsSortBy: string;
  resultsSortOrder: 'asc' | 'desc';
  resultsGroupBy: 'none' | 'sector' | 'signal_type';
  resultsMinScore: number;
  selectedResult: ScanResult | null;

  // ─── Quick-View ───
  quickViewOpen: boolean;
  quickViewSymbol: string | null;
  quickViewTab: 'chart' | 'signals' | 'fundamentals' | 'news';

  // ─── Anomalies ───
  anomalies: Anomaly[];
  anomalyConfig: AnomalyConfig;

  // ─── Alerts ───
  alerts: ScanAlert[];
  unreadAlertCount: number;
  alertDropdownOpen: boolean;

  // ─── Scans Library ───
  savedScans: ScanDefinition[];

  // ─── Dashboard ───
  marketOverview: MarketOverview;
  activeScanSummaries: ScanSummaryCard[];
  heatmapData: HeatmapCell[];

  // ─── Pipeline ───
  pipelineActions: PipelineAction[];
  quickBacktestResult: QuickBacktestResult | null;
  quickBacktestLoading: boolean;

  // ─── Scan Builder ───
  builderCollapsed: boolean;

  // ─── Actions ───
  setActiveScan: (scan: ScanDefinition | null) => void;
  setScanStatus: (status: 'idle' | 'running' | 'paused' | 'error') => void;

  updateResults: (action: 'snapshot' | 'add' | 'remove' | 'update', results: ScanResult[]) => void;
  sortResults: (by: string, order: 'asc' | 'desc') => void;
  groupResults: (by: 'none' | 'sector' | 'signal_type') => void;
  filterResultsByMinScore: (minScore: number) => void;
  selectResult: (result: ScanResult | null) => void;

  openQuickView: (symbol: string) => void;
  closeQuickView: () => void;
  setQuickViewTab: (tab: 'chart' | 'signals' | 'fundamentals' | 'news') => void;

  addAnomaly: (anomaly: Anomaly) => void;
  removeAnomaly: (id: string) => void;
  dismissAnomaly: (id: string) => void;
  setAnomalyConfig: (config: AnomalyConfig) => void;

  addAlert: (alert: ScanAlert) => void;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  setAlertDropdownOpen: (open: boolean) => void;

  setSavedScans: (scans: ScanDefinition[]) => void;
  addSavedScan: (scan: ScanDefinition) => void;
  removeSavedScan: (id: string) => void;
  updateSavedScan: (scan: ScanDefinition) => void;

  setMarketOverview: (overview: MarketOverview) => void;
  setActiveScanSummaries: (summaries: ScanSummaryCard[]) => void;
  setHeatmapData: (data: HeatmapCell[]) => void;

  addPipelineAction: (action: PipelineAction) => void;
  setQuickBacktestResult: (result: QuickBacktestResult | null) => void;
  setQuickBacktestLoading: (loading: boolean) => void;

  setBuilderCollapsed: (collapsed: boolean) => void;
}

const defaultAnomalyConfig: AnomalyConfig = {
  correlationBreaks: { enabled: true, sigma: 2.5 },
  volumeAnomalies: { enabled: true, sigma: 3.0 },
  volatilityDivergence: { enabled: true, sigma: 2.0 },
  sectorRotation: { enabled: true, sigma: 1.5 },
  priceVolumeDivergence: { enabled: true, sigma: 2.0 },
  crossAssetSignals: { enabled: false, sigma: 2.0 },
  breadthDivergence: { enabled: true, sigma: 2.0 },
  cooldownHours: 4,
};

const defaultMarketOverview: MarketOverview = {
  sp500: { value: 0, change: 0, changePct: 0 },
  nasdaq: { value: 0, change: 0, changePct: 0 },
  russell2000: { value: 0, change: 0, changePct: 0 },
  vix: { value: 0, change: 0 },
  regime: 'Unknown',
  breadth: 0,
  newHighs: 0,
  newLows: 0,
  updatedAt: '',
};

export const useScannerStore = create<ScannerStore>((set) => ({
  // Initial state
  activeScan: null,
  scanStatus: 'idle',

  results: [],
  resultsSortBy: 'score',
  resultsSortOrder: 'desc',
  resultsGroupBy: 'none',
  resultsMinScore: 0,
  selectedResult: null,

  quickViewOpen: false,
  quickViewSymbol: null,
  quickViewTab: 'chart',

  anomalies: [],
  anomalyConfig: defaultAnomalyConfig,

  alerts: [],
  unreadAlertCount: 0,
  alertDropdownOpen: false,

  savedScans: [],

  marketOverview: defaultMarketOverview,
  activeScanSummaries: [],
  heatmapData: [],

  pipelineActions: [],
  quickBacktestResult: null,
  quickBacktestLoading: false,

  builderCollapsed: false,

  // Actions
  setActiveScan: (scan) => set({ activeScan: scan }),
  setScanStatus: (status) => set({ scanStatus: status }),

  updateResults: (action, results) =>
    set((state) => {
      switch (action) {
        case 'snapshot':
          return { results };
        case 'add':
          return {
            results: [...results, ...state.results].sort((a, b) => b.score - a.score),
          };
        case 'remove': {
          const removeIds = new Set(results.map((r) => r.id));
          return { results: state.results.filter((r) => !removeIds.has(r.id)) };
        }
        case 'update': {
          const updateMap = new Map(results.map((r) => [r.id, r]));
          return {
            results: state.results
              .map((r) => updateMap.get(r.id) ?? r)
              .sort((a, b) => b.score - a.score),
          };
        }
        default:
          return {};
      }
    }),

  sortResults: (by, order) =>
    set((state) => ({
      resultsSortBy: by,
      resultsSortOrder: order,
      results: [...state.results].sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[by];
        const bVal = (b as unknown as Record<string, unknown>)[by];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return order === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal);
        const bStr = String(bVal);
        return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      }),
    })),

  groupResults: (by) => set({ resultsGroupBy: by }),
  filterResultsByMinScore: (minScore) => set({ resultsMinScore: minScore }),
  selectResult: (result) => set({ selectedResult: result }),

  openQuickView: (symbol) => set({ quickViewOpen: true, quickViewSymbol: symbol, quickViewTab: 'chart' }),
  closeQuickView: () => set({ quickViewOpen: false, quickViewSymbol: null }),
  setQuickViewTab: (tab) => set({ quickViewTab: tab }),

  addAnomaly: (anomaly) =>
    set((state) => ({
      anomalies: [anomaly, ...state.anomalies].slice(0, 100),
    })),
  removeAnomaly: (id) =>
    set((state) => ({
      anomalies: state.anomalies.filter((a) => a.id !== id),
    })),
  dismissAnomaly: (id) =>
    set((state) => ({
      anomalies: state.anomalies.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
    })),
  setAnomalyConfig: (config) => set({ anomalyConfig: config }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 200),
      unreadAlertCount: state.unreadAlertCount + 1,
    })),
  markAlertRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, readAt: new Date().toISOString() } : a,
      ),
      unreadAlertCount: Math.max(0, state.unreadAlertCount - 1),
    })),
  markAllAlertsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, readAt: a.readAt ?? new Date().toISOString() })),
      unreadAlertCount: 0,
    })),
  setAlertDropdownOpen: (open) => set({ alertDropdownOpen: open }),

  setSavedScans: (scans) => set({ savedScans: scans }),
  addSavedScan: (scan) =>
    set((state) => ({ savedScans: [scan, ...state.savedScans] })),
  removeSavedScan: (id) =>
    set((state) => ({ savedScans: state.savedScans.filter((s) => s.id !== id) })),
  updateSavedScan: (scan) =>
    set((state) => ({
      savedScans: state.savedScans.map((s) => (s.id === scan.id ? scan : s)),
    })),

  setMarketOverview: (overview) => set({ marketOverview: overview }),
  setActiveScanSummaries: (summaries) => set({ activeScanSummaries: summaries }),
  setHeatmapData: (data) => set({ heatmapData: data }),

  addPipelineAction: (action) =>
    set((state) => ({ pipelineActions: [action, ...state.pipelineActions] })),
  setQuickBacktestResult: (result) => set({ quickBacktestResult: result }),
  setQuickBacktestLoading: (loading) => set({ quickBacktestLoading: loading }),

  setBuilderCollapsed: (collapsed) => set({ builderCollapsed: collapsed }),
}));
