import { useState, useCallback } from 'react';
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

export function useBacktestStore() {
  const [pinnedResults, setPinnedResults] = useState<BacktestResult[]>([]);
  const [recentResults, setRecentResults] = useState<BacktestResult[]>([]);
  const [activeResult, setActiveResult] = useState<BacktestResult | null>(null);
  const [comparisonResults, setComparisonResults] = useState<BacktestResult[]>([]);
  const [libraryEntries, setLibraryEntries] = useState<LibraryEntry[]>([]);
  const [libraryTotal, setLibraryTotal] = useState(0);

  const addResult = useCallback((result: BacktestResult) => {
    setActiveResult(result);
    setRecentResults((prev) => {
      const filtered = prev.filter((r) => r.id !== result.id);
      return [result, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const pinResultAction = useCallback(async (result: BacktestResult) => {
    try {
      await apiPin(result.id);
    } catch { /* server may not be available */ }
    setPinnedResults((prev) => {
      if (prev.some((r) => r.id === result.id)) return prev;
      return [result, ...prev];
    });
  }, []);

  const unpinResultAction = useCallback(async (resultId: string) => {
    try {
      await apiUnpin(resultId);
    } catch { /* server may not be available */ }
    setPinnedResults((prev) => prev.filter((r) => r.id !== resultId));
  }, []);

  const addToComparison = useCallback((result: BacktestResult) => {
    setComparisonResults((prev) => {
      if (prev.some((r) => r.id === result.id)) return prev;
      return [...prev, result].slice(0, 10);
    });
  }, []);

  const removeFromComparison = useCallback((resultId: string) => {
    setComparisonResults((prev) => prev.filter((r) => r.id !== resultId));
  }, []);

  const saveToLibraryAction = useCallback(
    async (resultId: string, name: string, notes?: string, tags?: string[]) => {
      try {
        const entry = await apiSave({ result_id: resultId, name, notes, tags });
        setLibraryEntries((prev) => [entry, ...prev]);
        setLibraryTotal((t) => t + 1);
      } catch { /* handle gracefully */ }
    },
    []
  );

  const fetchLibrary = useCallback(async (filters: LibraryFilters) => {
    try {
      const { entries, total } = await getLibrary(filters);
      setLibraryEntries(entries);
      setLibraryTotal(total);
    } catch { /* handle gracefully */ }
  }, []);

  const fetchPinnedResults = useCallback(async () => {
    try {
      const results = await getPinnedResults();
      setPinnedResults(results);
    } catch { /* handle gracefully */ }
  }, []);

  const deleteFromLibrary = useCallback(async (id: string) => {
    try {
      await deleteLibraryEntry(id);
      setLibraryEntries((prev) => prev.filter((e) => e.id !== id));
      setLibraryTotal((t) => Math.max(0, t - 1));
    } catch { /* handle gracefully */ }
  }, []);

  return {
    pinnedResults,
    recentResults,
    activeResult,
    setActiveResult,
    comparisonResults,
    libraryEntries,
    libraryTotal,
    addResult,
    pinResult: pinResultAction,
    unpinResult: unpinResultAction,
    addToComparison,
    removeFromComparison,
    saveToLibrary: saveToLibraryAction,
    fetchLibrary,
    fetchPinnedResults,
    deleteFromLibrary,
  };
}
