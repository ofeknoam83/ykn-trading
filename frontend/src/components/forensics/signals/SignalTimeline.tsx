import { useState, useMemo } from 'react';
import type { BacktestResult } from '../../../types/backtest';
import type { BacktestSignalLog, SignalOutcome } from '../../../types/forensics';
import { SignalCard } from './SignalCard';
import { SignalMiniChart } from './SignalMiniChart';
import { SignalSummaryStats } from './SignalSummaryStats';

interface SignalTimelineProps {
  result: BacktestResult;
  signalLog: BacktestSignalLog | null;
  selectedTradeId: string | null;
  loading: boolean;
  error: string | null;
  onNavigateToReplay: (tradeId: string) => void;
  onNavigateToWhatIf: (tradeId: string) => void;
}

type FilterCategory = 'all' | SignalOutcome;

export function SignalTimeline({
  result,
  signalLog,
  selectedTradeId,
  loading,
  error,
  onNavigateToReplay,
  onNavigateToWhatIf,
}: SignalTimelineProps) {
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterSymbol, setFilterSymbol] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(50);

  // Get unique symbols
  const symbols = useMemo(() => {
    if (!signalLog) return [];
    const syms = new Set(signalLog.signals.map((s) => s.symbol));
    return Array.from(syms).sort();
  }, [signalLog]);

  // Filter signals
  const filteredSignals = useMemo(() => {
    if (!signalLog) return [];
    let signals = signalLog.signals;

    if (filterCategory !== 'all') {
      signals = signals.filter((s) => s.outcome === filterCategory);
    }
    if (filterSymbol !== 'all') {
      signals = signals.filter((s) => s.symbol === filterSymbol);
    }

    // Sort by timestamp descending
    return [...signals].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [signalLog, filterCategory, filterSymbol]);

  const visibleSignals = filteredSignals.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="tf-signals">
        <div className="tf-loading">Loading signal timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tf-signals">
        <div className="tf-error">Failed to load signals: {error}</div>
      </div>
    );
  }

  if (!signalLog) {
    return (
      <div className="tf-signals">
        <div className="tf-empty-state">No signal data available.</div>
      </div>
    );
  }

  const categoryFilters: { key: FilterCategory; label: string; color: string }[] = [
    { key: 'all', label: 'All', color: '#8b949e' },
    { key: 'executed', label: 'Executed', color: '#3fb950' },
    { key: 'filtered', label: 'Filtered', color: '#58a6ff' },
    { key: 'weak', label: 'Weak', color: '#8b949e' },
    { key: 'conflicted', label: 'Conflicted', color: '#d29922' },
  ];

  return (
    <div className="tf-signals">
      {/* Filter Bar */}
      <div className="tf-signals-filter-bar">
        <div className="tf-filter-pills">
          {categoryFilters.map((f) => {
            const count =
              f.key === 'all'
                ? signalLog.signals.length
                : signalLog.signals.filter((s) => s.outcome === f.key).length;
            return (
              <button
                key={f.key}
                className={`tf-filter-pill ${filterCategory === f.key ? 'tf-filter-active' : ''}`}
                style={
                  filterCategory === f.key
                    ? { borderColor: f.color, color: f.color }
                    : undefined
                }
                onClick={() => setFilterCategory(f.key)}
              >
                {f.label}
                <span className="tf-pill-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="tf-signal-symbol-filter">
          <label>Symbol:</label>
          <select
            className="bt-select"
            value={filterSymbol}
            onChange={(e) => setFilterSymbol(e.target.value)}
          >
            <option value="all">All</option>
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mini Chart */}
      <SignalMiniChart
        signals={signalLog.signals}
        equityCurve={result.equity_curve}
        selectedTradeId={selectedTradeId}
      />

      {/* Timeline */}
      <div className="tf-signal-list">
        {visibleSignals.map((signal) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            onNavigateToReplay={
              signal.trade_id ? () => onNavigateToReplay(signal.trade_id!) : undefined
            }
            onNavigateToWhatIf={() => onNavigateToWhatIf(signal.trade_id ?? signal.id)}
          />
        ))}

        {filteredSignals.length > visibleCount && (
          <button
            className="bt-btn tf-load-more"
            onClick={() => setVisibleCount((c) => c + 50)}
          >
            Load more ({filteredSignals.length - visibleCount} remaining)
          </button>
        )}

        {filteredSignals.length === 0 && (
          <div className="tf-empty-state">No signals match the current filters.</div>
        )}
      </div>

      {/* Summary */}
      <SignalSummaryStats summary={signalLog.summary} />
    </div>
  );
}
