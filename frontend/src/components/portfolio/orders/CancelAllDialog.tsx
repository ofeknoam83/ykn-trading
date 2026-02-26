import type { OrderRecord } from '../../../types/portfolio';

interface Props {
  orders: OrderRecord[];
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelAllDialog({ orders, onClose, onConfirm }: Props) {
  return (
    <div className="poc-dialog-overlay" onClick={onClose}>
      <div className="poc-dialog" onClick={(e) => e.stopPropagation()}>
        <h4>Cancel All Open Orders</h4>
        <p>Cancel all {orders.length} open orders?</p>
        <div className="poc-cancel-all-list">
          {orders.map((o) => (
            <div key={o.id} className="poc-cancel-order-item">
              <span className={`poc-side-pill ${o.side}`}>{o.side.toUpperCase()}</span>
              <span className="poc-mono">{o.quantity} {o.symbol}</span>
              <span className="poc-muted">
                {o.order_type === 'market' ? 'Market' : `@ $${(o.limit_price ?? o.stop_price ?? 0).toFixed(2)}`}
              </span>
              <span className="poc-muted">{o.source_name}</span>
            </div>
          ))}
        </div>
        <div className="poc-dialog-actions">
          <button className="poc-btn-secondary" onClick={onClose}>Keep Orders</button>
          <button className="poc-btn-danger" onClick={onConfirm}>Cancel All</button>
        </div>
      </div>
    </div>
  );
}
