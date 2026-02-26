import { useMemo, useState } from 'react';
import type { TradeRecord } from '../../../types/backtest';
import type { TimingMetrics } from '../../../types/forensics';

interface TimingTableProps {
  metrics: TimingMetrics[];
  trades: TradeRecord[];
  selectedTradeId: string | null;
  onSelectTrade: (tradeId: string) => void;
}

function efficiencyBadge(eff: number) {
  const pct = (eff * 100).toFixed(0);
  if (eff >= 0.6) return <span className="bt-metric-positive">{pct}%</span>;
  if (eff >= 0.4) return <span className="tf-metric-warning">{pct}%</span>;
  return <span className="bt-metric-negative">{pct}%</span>;
}

export function TimingTable({ metrics, trades, selectedTradeId, onSelectTrade }: TimingTableProps) {
  const [page, setPage] = useState(0);
  const perPage = 20;

  const tradeMap = useMemo(() => {
    const map = new Map<string, TradeRecord>();
    for (const t of trades) map.set(t.id, t);
    return map;
  }, [trades]);

  const paged = metrics.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(metrics.length / perPage);

  return (
    <div className="tf-timing-table">
      <h5>Per-Trade Timing Metrics</h5>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Symbol</th>
            <th>Entry Eff</th>
            <th>Exit Eff</th>
            <th>Overall</th>
            <th>Actual</th>
            <th>Optimal</th>
            <th>Captured</th>
            <th>MAE</th>
            <th>MFE</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((m, i) => {
            const trade = tradeMap.get(m.trade_id);
            const isSelected = m.trade_id === selectedTradeId;
            return (
              <tr
                key={m.trade_id}
                className={`tf-clickable-row ${isSelected ? 'tf-row-selected' : ''}`}
                onClick={() => onSelectTrade(m.trade_id)}
              >
                <td>{page * perPage + i + 1}</td>
                <td className="mono">{trade?.symbol ?? '—'}</td>
                <td>{efficiencyBadge(m.entry_efficiency)}</td>
                <td>{efficiencyBadge(m.exit_efficiency)}</td>
                <td>{efficiencyBadge(m.overall_efficiency)}</td>
                <td className={`mono ${m.actual_return >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                  {(m.actual_return * 100).toFixed(1)}%
                </td>
                <td className="mono">{(m.optimal_return * 100).toFixed(1)}%</td>
                <td className={`mono ${m.captured_pct >= 0.5 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                  {(m.captured_pct * 100).toFixed(0)}%
                </td>
                <td className="mono bt-metric-negative">
                  {(m.max_adverse_excursion * 100).toFixed(1)}%
                </td>
                <td className="mono bt-metric-positive">
                  +{(m.max_favorable_excursion * 100).toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="bt-pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            {page + 1} of {totalPages}
          </span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
