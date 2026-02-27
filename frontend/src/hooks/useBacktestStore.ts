import { create } from 'zustand';
import type { BacktestResult, LibraryEntry, LibraryFilters } from '../types/backtest';
import {
  getPinnedResults,
  pinResult as apiPin,
  unpinResult as apiUnpin,
  saveToLibrary as apiSave,
  getLibrary,
  deleteLibraryEntry,
} from '../api/backtestApi';

const MAX_RECENT = 10;

interface BacktestStoreState {
  pinnedResults: BacktestResult[];
  recentResults: BacktestResult[];
  activeResult: BacktestResult | null;
  comparisonResults: BacktestResult[];
  libraryEntries: LibraryEntry[];
  libraryTotal: number;

  addResult: (result: BacktestResult) => void;
  setActiveResult: (result: BacktestResult | null) => void;
  pinResult: (result: BacktestResult) => Promise<void>;
  unpinResult: (resultId: string) => Promise<void>;
  addToComparison: (result: BacktestResult) => void;
  removeFromComparison: (resultId: string) => void;
  saveToLibrary: (resultId: string, name: string, notes?: string, tags?: string[]) => Promise<void>;
  fetchLibrary: (filters: LibraryFilters) => Promise<void>;
  fetchPinnedResults: () => Promise<void>;
  deleteFromLibrary: (id: string) => Promise<void>;
}

export const useBacktestStore = create<BacktestStoreState>((set) => ({
  pinnedResults: [],
  recentResults: [],
  activeResult: null,
  comparisonResults: [],
  libraryEntries: [],
  libraryTotal: 0,

  addResult: (result) =>
    set((state) => ({
      activeResult: result,
      recentResults: [result, ...state.recentResults.filter((r) => r.id !== result.id)].slice(0, MAX_RECENT),
    })),

  setActiveResult: (result) => set({ activeResult: result }),

  pinResult: async (result) => {
    try {
      await apiPin(result.id);
    } catch { /* server may not be available */ }
    set((state) => {
      if (state.pinnedResults.some((r) => r.id === result.id)) return state;
      return { pinnedResults: [result, ...state.pinnedResults] };
    });
  },

  unpinResult: async (resultId) => {
    try {
      await apiUnpin(resultId);
    } catch { /* server may not be available */ }
    set((state) => ({
      pinnedResults: state.pinnedResults.filter((r) => r.id !== resultId),
    }));
  },

  addToComparison: (result) =>
    set((state) => {
      if (state.comparisonResults.some((r) => r.id === result.id)) return state;
      return { comparisonResults: [...state.comparisonResults, result].slice(0, 10) };
    }),

  removeFromComparison: (resultId) =>
    set((state) => ({
      comparisonResults: state.comparisonResults.filter((r) => r.id !== resultId),
    })),

  saveToLibrary: async (resultId, name, notes, tags) => {
    try {
      const entry = await apiSave({ result_id: resultId, name, notes, tags });
      set((state) => ({
        libraryEntries: [entry, ...state.libraryEntries],
        libraryTotal: state.libraryTotal + 1,
      }));
    } catch { /* handle gracefully */ }
  },

  fetchLibrary: async (filters) => {
    try {
      const { entries, total } = await getLibrary(filters);
      set({ libraryEntries: entries, libraryTotal: total });
    } catch { /* handle gracefully */ }
  },

  fetchPinnedResults: async () => {
    try {
      const results = await getPinnedResults();
      set({ pinnedResults: results });
    } catch { /* handle gracefully */ }
  },

  deleteFromLibrary: async (id) => {
    try {
      await deleteLibraryEntry(id);
      set((state) => ({
        libraryEntries: state.libraryEntries.filter((e) => e.id !== id),
        libraryTotal: Math.max(0, state.libraryTotal - 1),
      }));
    } catch { /* handle gracefully */ }
  },
}));
