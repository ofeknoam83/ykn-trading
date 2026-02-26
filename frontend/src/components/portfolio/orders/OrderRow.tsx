import { useState } from 'react';
import type { OrderRecord } from '../../../types/portfolio';
import { modifyOrder, cancelOrder } from '../../../api/portfolioApi';

interface Props {
  order: OrderRecord;
  onRefresh: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function OrderRow({ order, onRefresh }: Props) {
  const [editing, setEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(String(order.limit_price ?? order.stop_price ?? ''));
  const [editQty, setEditQty] = useState(String(order.quantity));
  const [cancelling, setCancelling] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOpen = order.status === 'pending' || order.status === 'partial';
  const canModify = isOpen && order.order_type !== 'market';

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelOrder(order.id);
      onRefresh();
    } catch {
      // silent
    } finally {
      setCancelling(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await modifyOrder(order.id, {
        price: parseFloat(editPrice),
        quantity: parseFloat(editQty),
      });
      setEditing(false);
      onRefresh();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className={`poc-order-row ${order.status === 'cancelled' ? 'cancelled' : ''}`}>
      <td className="poc-muted">{formatTime(order.timestamp)}</td>
      <td className="poc-mono">{order.symbol}</td>
      <td>
        <span className={`poc-side-pill ${order.side}`}>
          {order.side === 'buy' ? 'Buy' : 'Sell'}
        </span>
      </td>
      <td>
        <span className={`poc-order-type-badge poc-type-${order.order_type}`}>
          {order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1)}
        </span>
      </td>
      <td className="poc-right poc-mono">
        {editing ? (
          <input
            className="poc-inline-edit"
            type="number"
            value={editQty}
            onChange={(e) => setEditQty(e.target.value)}
          />
        ) : (
          order.quantity.toLocaleString()
        )}
      </td>
      <td className="poc-right poc-mono">
        {editing ? (
          <input
            className="poc-inline-edit"
            type="number"
            step="0.01"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
          />
        ) : order.order_type === 'market' ? (
          'Market'
        ) : (
          `$${formatMoney(order.limit_price ?? order.stop_price ?? 0)}`
        )}
      </td>
      <td className="poc-right poc-mono">
        {order.filled_quantity}/{order.quantity}
      </td>
      <td>
        <span className={`poc-status-badge poc-status-${order.status}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </td>
      <td>
        <span className={`poc-source-badge poc-source-${order.source_type}`}>
          {order.source_name}
        </span>
      </td>
      <td className="poc-order-actions">
        {editing ? (
          <>
            <button className="poc-btn-xs poc-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '...' : 'Save'}
            </button>
            <button className="poc-btn-xs poc-btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          isOpen && (
            <>
              {canModify && (
                <button className="poc-btn-xs poc-btn-ghost" onClick={() => setEditing(true)}>
                  Modify
                </button>
              )}
              <button
                className="poc-btn-xs poc-btn-danger-ghost"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? '...' : 'Cancel'}
              </button>
            </>
          )
        )}
      </td>
    </tr>
  );
}
