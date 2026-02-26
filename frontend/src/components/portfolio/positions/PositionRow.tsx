import { useState } from 'react';
import type { Position } from '../../../types/portfolio';
import { PositionExpanded } from './PositionExpanded';
import { PositionActions } from './PositionActions';

interface Props {
  position: Position;
  expanded: boolean;
  onToggleExpand: () => void;
  onRefresh: () => void;
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPnL(amount: number, percent: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}$${formatMoney(Math.abs(amount))} (${sign}${percent.toFixed(2)}%)`;
}

export function PositionRow({ position, expanded, onToggleExpand, onRefresh }: Props) {
  const [showActions, setShowActions] = useState(false);
  const p = position;

  return (
    <>
      <tr
        className={`poc-position-row ${expanded ? 'expanded' : ''}`}
        onClick={onToggleExpand}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <td>
          <div className="poc-symbol-cell">
            <span className="poc-symbol">{p.symbol}</span>
            <span className={`poc-asset-badge poc-badge-${p.asset_class}`}>{p.asset_class.toUpperCase()}</span>
          </div>
        </td>
        <td className="poc-name-cell">{p.name}</td>
        <td className="poc-right poc-mono">{p.quantity.toLocaleString()}</td>
        <td>
          <span className={`poc-side-pill ${p.side}`}>{p.side === 'long' ? 'Long' : 'Short'}</span>
        </td>
        <td className="poc-right poc-mono">${formatMoney(p.avg_cost)}</td>
        <td className="poc-right poc-mono">${formatMoney(p.current_price)}</td>
        <td className="poc-right poc-mono">${formatMoney(p.market_value)}</td>
        <td className="poc-right poc-mono">{p.weight_pct.toFixed(1)}%</td>
        <td className={`poc-right poc-mono poc-pnl ${p.day_pnl.amount >= 0 ? 'positive' : 'negative'}`}>
          {formatPnL(p.day_pnl.amount, p.day_pnl.percent)}
        </td>
        <td className={`poc-right poc-mono poc-pnl ${p.total_pnl.amount >= 0 ? 'positive' : 'negative'}`}>
          {formatPnL(p.total_pnl.amount, p.total_pnl.percent)}
        </td>
        <td className="poc-actions-cell" onClick={(e) => e.stopPropagation()}>
          <PositionActions position={p} visible={showActions} onRefresh={onRefresh} />
        </td>
      </tr>
      {expanded && (
        <tr className="poc-position-expanded-row">
          <td colSpan={11}>
            <PositionExpanded position={p} />
          </td>
        </tr>
      )}
    </>
  );
}
