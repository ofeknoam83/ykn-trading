import { useState, useEffect, useCallback } from 'react';
import type { LibraryEntry, LibraryFilters, BacktestResult } from '../../../types/backtest';
import { getBacktestResult } from '../../../api/backtestApi';
import { LibrarySearch } from './LibrarySearch';
import { LibraryEntryCard } from './LibraryEntry';
import { ResultsAnalyticsSuite } from '../analytics/ResultsAnalyticsSuite';

interface BacktestLibraryProps {
  entries: LibraryEntry[];
  total: number;
  onFetch: (filters: LibraryFilters) => void;
  onDelete: (id: string) => void;
  onCompare: (result: BacktestResult) => void;
}

export function BacktestLibrary({ entries, total, onFetch, onDelete, onCompare }: BacktestLibraryProps) {
  const [filters, setFilters] = useState<LibraryFilters>({ sort: 'recent', per_page: 20 });
  const [selectedResult, setSelectedResult] = useState<BacktestResult | null>(null);

  useEffect(() => {
    onFetch(filters);
  }, [filters, onFetch]);

  const handleView = useCallback(async (entry: LibraryEntry) => {
    try {
      const result = await getBacktestResult(entry.result_id);
      setSelectedResult(result);
    } catch { /* */ }
  }, []);

  const handleReRun = useCallback((entry: LibraryEntry) => {
    // This would navigate to workbench with config pre-loaded
    // For now, just log
    console.log('Re-run config:', entry.config);
  }, []);

  const handleCompare = useCallback(async (entry: LibraryEntry) => {
    try {
      const result = await getBacktestResult(entry.result_id);
      onCompare(result);
    } catch { /* */ }
  }, [onCompare]);

  return (
    <div className="bt-library">
      <div className="bt-library-header">
        <h3>Backtest Library</h3>
        <span className="bt-library-count">{total} results</span>
      </div>

      <LibrarySearch filters={filters} onChange={setFilters} />

      {selectedResult ? (
        <div className="bt-library-detail">
          <button className="bt-btn bt-btn-secondary bt-back-btn" onClick={() => setSelectedResult(null)}>
            \u2190 Back to Library
          </button>
          <ResultsAnalyticsSuite result={selectedResult} showRegime showMonteCarlo />
        </div>
      ) : (
        <div className="bt-library-list">
          {entries.length === 0 ? (
            <div className="bt-empty">
              <p>No saved results yet.</p>
              <p className="bt-hint">Run backtests and click "Save" to add them to your library.</p>
            </div>
          ) : (
            entries.map((entry) => (
              <LibraryEntryCard
                key={entry.id}
                entry={entry}
                onView={() => handleView(entry)}
                onCompare={() => handleCompare(entry)}
                onReRun={() => handleReRun(entry)}
                onDelete={() => {
                  if (confirm(`Delete "${entry.name}" from library?`)) {
                    onDelete(entry.id);
                  }
                }}
              />
            ))
          )}
          {entries.length < total && (
            <button
              className="bt-btn bt-btn-secondary bt-load-more"
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              Load More ({total - entries.length} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
