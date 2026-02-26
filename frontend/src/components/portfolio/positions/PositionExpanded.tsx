import type { Position } from '../../../types/portfolio';

interface Props {
  position: Position;
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPnL(amount: number, percent: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}$${formatMoney(Math.abs(amount))} (${sign}${percent.toFixed(2)}%)`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const SOURCE_ICONS: Record<string, string> = {
  strategy: '\u{1F4C8}',
  agent: '\u{1F916}',
  manual: '\u{1F464}',
  script: '\u{1F4DC}',
};

export function PositionExpanded({ position }: Props) {
  const allTrades = position.attributions
    .flatMap((a) => a.entry_trades)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="poc-expanded">
      <div className="poc-expanded-section">
        <h4 className="poc-expanded-title">{position.symbol} Attribution</h4>
        <table className="poc-attr-table">
          <thead>
            <tr>
              <th>Source</th>
              <th className="poc-right">Qty</th>
              <th className="poc-right">Avg Cost</th>
              <th className="poc-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            {position.attributions.map((attr) => (
              <tr key={attr.source_id}>
                <td>
                  <span className="poc-attr-icon">{SOURCE_ICONS[attr.source_type] ?? ''}</span>
                  {attr.source_name}
                </td>
                <td className="poc-right poc-mono">{attr.quantity.toLocaleString()}</td>
                <td className="poc-right poc-mono">${formatMoney(attr.avg_cost)}</td>
                <td className={`poc-right poc-mono poc-pnl ${attr.pnl.amount >= 0 ? 'positive' : 'negative'}`}>
                  {formatPnL(attr.pnl.amount, attr.pnl.percent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allTrades.length > 0 && (
        <div className="poc-expanded-section">
          <h4 className="poc-expanded-title">Recent Trades</h4>
          <div className="poc-trades-list">
            {allTrades.slice(0, 10).map((trade) => (
              <div key={trade.id} className="poc-trade-entry">
                <span className="poc-trade-date">{formatDate(trade.timestamp)}</span>
                <span className={`poc-trade-side ${trade.side}`}>
                  {trade.side.toUpperCase()}
                </span>
                <span className="poc-mono">
                  {trade.quantity} @ ${formatMoney(trade.price)}
                </span>
                <span className="poc-trade-source">{trade.source_name}</span>
                <span className="poc-trade-fees">${formatMoney(trade.fees)} fees</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {position.greeks && (
        <div className="poc-expanded-section">
          <h4 className="poc-expanded-title">Greeks</h4>
          <div className="poc-greeks-row">
            <span>\u0394 {position.greeks.delta.toFixed(2)}</span>
            <span>\u0393 {position.greeks.gamma.toFixed(4)}</span>
            <span>\u0398 {position.greeks.theta.toFixed(2)}</span>
            <span>V {position.greeks.vega.toFixed(2)}</span>
            <span>IV {(position.greeks.iv * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
