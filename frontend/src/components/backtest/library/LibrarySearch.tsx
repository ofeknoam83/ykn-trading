import type { LibraryFilters } from '../../../types/backtest';

interface LibrarySearchProps {
  filters: LibraryFilters;
  onChange: (filters: LibraryFilters) => void;
}

const STRATEGY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'sma_crossover', label: 'SMA Crossover' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'mean_reversion', label: 'Mean Reversion' },
  { value: 'breakout', label: 'Breakout' },
  { value: 'stat_arb', label: 'Statistical Arbitrage' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recent' },
  { value: 'sharpe', label: 'Sharpe (desc)' },
  { value: 'return', label: 'Return (desc)' },
  { value: 'max_dd', label: 'Max DD (asc)' },
  { value: 'name', label: 'Name (A-Z)' },
];

export function LibrarySearch({ filters, onChange }: LibrarySearchProps) {
  return (
    <div className="bt-library-search">
      <input
        type="text"
        className="bt-input bt-search-input"
        placeholder="Search results..."
        value={filters.q ?? ''}
        onChange={(e) => onChange({ ...filters, q: e.target.value, page: 1 })}
      />
      <select
        className="bt-select"
        value={filters.type ?? ''}
        onChange={(e) => onChange({ ...filters, type: e.target.value || undefined, page: 1 })}
      >
        {STRATEGY_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <select
        className="bt-select"
        value={filters.sort ?? 'recent'}
        onChange={(e) => onChange({ ...filters, sort: e.target.value as LibraryFilters['sort'], page: 1 })}
      >
        {SORT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
