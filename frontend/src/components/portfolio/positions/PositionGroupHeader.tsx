import type { ReactNode } from 'react';

interface Props {
  name: string;
  count: number;
  dayPnl: number;
  collapsed: boolean;
  onToggle: () => void;
  showHeader: boolean;
  children: ReactNode;
}

function formatMoney(n: number): string {
  const sign = n >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PositionGroupHeader({ name, count, dayPnl, collapsed, onToggle, showHeader, children }: Props) {
  if (!showHeader) {
    return <>{children}</>;
  }

  return (
    <>
      <tr className="poc-group-header-row" onClick={onToggle}>
        <td colSpan={11}>
          <div className="poc-group-header">
            <span className="poc-group-chevron">{collapsed ? '\u25B6' : '\u25BC'}</span>
            <span className="poc-group-name">{name}</span>
            <span className="poc-group-count">{count} position{count !== 1 ? 's' : ''}</span>
            <span className={`poc-group-pnl ${dayPnl >= 0 ? 'positive' : 'negative'}`}>
              Day: {formatMoney(dayPnl)}
            </span>
          </div>
        </td>
      </tr>
      {children}
    </>
  );
}
