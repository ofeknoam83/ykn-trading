import { useState, useMemo } from 'react';
import type { TradeRecord } from '../../types/backtest';

interface TradeSelectorProps {
  trades: TradeRecord[];
  selectedTradeId: string | null;
  onSelectTrade: (tradeId: string) => void;
}

type SortKey = 'entry_date' | 'pnl' | 'pnl_pct' | 'duration_days';
type FilterType = 'all' | 'winners' | 'losers' | 'breakeven';

export function TradeSelector({ trades, selectedTradeId, onSelectTrade }: TradeSelectorProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortKey, setSortKey] = useState<SortKey>('entry_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [searchSymbol, setSearchSymbol] = useState('');

  const filtered = useMemo(() => {
    let list = [...trades];

    // Filter by outcome
    if (filter === 'winners') list = list.filter((t) => t.pnl > 0);
    else if (filter === 'losers') list = list.filter((t) => t.pnl < 0);
    else if (filter === 'breakeven') list = list.filter((t) => t.pnl === 0);

    // Filter by symbol search
    if (searchSymbol.trim()) {
      const q = searchSymbol.trim().toUpperCase();
      list = list.filter((t) => t.symbol.toUpperCase().includes(q));
    }

    // Sort
    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

    return list;
  }, [trades, filter, sortKey, sortDir, searchSymbol]);

  const counts = useMemo(() => ({
    all: trades.length,
    winners: trades.filter((t) => t.pnl > 0).length,
    losers: trades.filter((t) => t.pnl < 0).length,
    breakeven: trades.filter((t) => t.pnl === 0).length,
  }), [trades]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  function getTradeClass(trade: TradeRecord) {
    const base = 'tf-trade-item';
    const selected = trade.id === selectedTradeId ? 'tf-trade-selected' : '';
    const outcome = trade.pnl > 0 ? 'tf-trade-winner' : trade.pnl < 0 ? 'tf-trade-loser' : 'tf-trade-even';
    return `${base} ${selected} ${outcome}`;
  }

  return (
    <div className="tf-trade-selector">
      <div className="tf-selector-header">
        <h4>Trades ({filtered.length})</h4>
      </div>

      <input
        type="text"
        className="bt-input tf-symbol-search"
        placeholder="Search symbol..."
        value={searchSymbol}
        onChange={(e) => setSearchSymbol(e.target.value)}
      />

      <div className="tf-filter-pills">
        {(['all', 'winners', 'losers', 'breakeven'] as FilterType[]).map((f) => (
          <button
            key={f}
            className={`tf-filter-pill ${filter === f ? 'tf-filter-active' : ''} tf-filter-${f}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'winners' ? 'Win' : f === 'losers' ? 'Loss' : 'Even'}
            <span className="tf-pill-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="tf-sort-controls">
        <select
          className="bt-select tf-sort-select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
        >
          <option value="entry_date">Date</option>
          <option value="pnl">P&L ($)</option>
          <option value="pnl_pct">P&L (%)</option>
          <option value="duration_days">Duration</option>
        </select>
        <button
          className="tf-sort-dir"
          onClick={() => toggleSort(sortKey)}
          title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortDir === 'asc' ? '\u25B2' : '\u25BC'}
        </button>
      </div>

      <div className="tf-trade-list">
        {filtered.map((trade) => (
          <div
            key={trade.id}
            className={getTradeClass(trade)}
            onClick={() => onSelectTrade(trade.id)}
          >
            <div className="tf-trade-row-top">
              <span className="tf-trade-dot">
                {trade.pnl > 0 ? '\u{1F7E2}' : trade.pnl < 0 ? '\u{1F534}' : '\u{1F7E1}'}
              </span>
              <span className="tf-trade-symbol mono">{trade.symbol}</span>
              <span className="tf-trade-side">{trade.side === 'long' ? 'LONG' : 'SHORT'}</span>
            </div>
            <div className="tf-trade-row-bottom">
              <span className="tf-trade-dates">
                {trade.entry_date.slice(0, 10)} → {trade.exit_date.slice(0, 10)}
              </span>
              <span className={`tf-trade-pnl mono ${trade.pnl >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                {trade.pnl >= 0 ? '+' : ''}{(trade.pnl_pct * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="tf-empty-state">No trades match filters</div>
        )}
      </div>
    </div>
  );
}
