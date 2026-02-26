import { useState, useMemo } from 'react';
import type { TradeRecord } from '../../../types/backtest';

interface TradesTableProps {
  trades: TradeRecord[];
  compact?: boolean;
}

type SortKey = 'entry_date' | 'exit_date' | 'pnl' | 'pnl_pct' | 'duration_days';
type SortDir = 'asc' | 'desc';

export function TradesTable({ trades, compact }: TradesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('entry_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const perPage = compact ? 10 : 25;

  const sorted = useMemo(() => {
    const copy = [...trades];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return copy;
  }, [trades, sortKey, sortDir]);

  const paged = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(trades.length / perPage);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function headerLabel(key: SortKey, label: string) {
    const arrow = sortKey === key ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : '';
    return (
      <th className="bt-th-sortable" onClick={() => toggleSort(key)}>
        {label}{arrow}
      </th>
    );
  }

  if (trades.length === 0) {
    return <div className="bt-empty">No trades recorded</div>;
  }

  return (
    <div className="bt-trades-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Symbol</th>
            <th>Side</th>
            {headerLabel('entry_date', 'Entry')}
            {headerLabel('exit_date', 'Exit')}
            <th>Entry $</th>
            <th>Exit $</th>
            <th>Qty</th>
            {headerLabel('pnl', 'P&L')}
            {headerLabel('pnl_pct', 'P&L %')}
            {headerLabel('duration_days', 'Duration')}
            <th>Fees</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((t, i) => (
            <tr key={t.id} className={t.pnl >= 0 ? 'bt-trade-win' : 'bt-trade-loss'}>
              <td>{page * perPage + i + 1}</td>
              <td className="mono">{t.symbol}</td>
              <td>{t.side}</td>
              <td>{t.entry_date.slice(0, 10)}</td>
              <td>{t.exit_date.slice(0, 10)}</td>
              <td className="mono">${t.entry_price.toFixed(2)}</td>
              <td className="mono">${t.exit_price.toFixed(2)}</td>
              <td className="mono">{t.quantity}</td>
              <td className={`mono ${t.pnl >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                ${t.pnl.toFixed(2)}
              </td>
              <td className={`mono ${t.pnl_pct >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                {(t.pnl_pct * 100).toFixed(2)}%
              </td>
              <td>{t.duration_days}d</td>
              <td className="mono">${t.fees.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="bt-pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span>{page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
