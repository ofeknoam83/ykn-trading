import { useState, useMemo } from 'react';
import type { OrderRecord } from '../../../types/portfolio';
import { OrderRow } from './OrderRow';
import { CancelAllDialog } from './CancelAllDialog';

interface Props {
  orders: OrderRecord[];
  orderTab: 'open' | 'filled' | 'cancelled' | 'all';
  onTabChange: (tab: 'open' | 'filled' | 'cancelled' | 'all') => void;
  onRefresh: () => void;
}

const ORDER_TABS = [
  { key: 'open' as const, label: 'Open' },
  { key: 'filled' as const, label: 'Filled Today' },
  { key: 'cancelled' as const, label: 'Cancelled' },
  { key: 'all' as const, label: 'All History' },
];

export function ActiveOrdersPanel({ orders, orderTab, onTabChange, onRefresh }: Props) {
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [cancelAllOpen, setCancelAllOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    switch (orderTab) {
      case 'open':
        filtered = filtered.filter((o) => o.status === 'pending' || o.status === 'partial');
        break;
      case 'filled':
        filtered = filtered.filter((o) => o.status === 'filled');
        break;
      case 'cancelled':
        filtered = filtered.filter((o) => o.status === 'cancelled');
        break;
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter((o) => o.source_name === sourceFilter);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [orders, orderTab, sourceFilter]);

  const openOrders = orders.filter((o) => o.status === 'pending' || o.status === 'partial');
  const sources = useMemo(() => {
    const s = new Set(orders.map((o) => o.source_name));
    return ['all', ...Array.from(s)];
  }, [orders]);

  const tabCounts = useMemo(() => ({
    open: orders.filter((o) => o.status === 'pending' || o.status === 'partial').length,
    filled: orders.filter((o) => o.status === 'filled').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    all: orders.length,
  }), [orders]);

  return (
    <div className="poc-orders-panel">
      <div className="poc-orders-header">
        <h3 className="poc-panel-title">Orders</h3>
        {orderTab === 'open' && openOrders.length > 0 && (
          <button className="poc-btn-danger-sm" onClick={() => setCancelAllOpen(true)}>
            Cancel All ({openOrders.length})
          </button>
        )}
      </div>

      <div className="poc-order-tabs">
        {ORDER_TABS.map((t) => (
          <button
            key={t.key}
            className={`poc-order-tab ${orderTab === t.key ? 'active' : ''}`}
            onClick={() => onTabChange(t.key)}
          >
            {t.label} ({tabCounts[t.key]})
          </button>
        ))}
      </div>

      <div className="poc-orders-filters">
        <select
          className="poc-source-filter"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          {sources.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Sources' : s}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="poc-orders-empty">No orders to display</div>
      ) : (
        <div className="poc-orders-table-wrap">
          <table className="poc-orders-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Type</th>
                <th className="poc-right">Qty</th>
                <th className="poc-right">Price</th>
                <th className="poc-right">Filled</th>
                <th>Status</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <OrderRow key={order.id} order={order} onRefresh={onRefresh} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelAllOpen && (
        <CancelAllDialog
          orders={openOrders}
          onClose={() => setCancelAllOpen(false)}
          onConfirm={() => {
            setCancelAllOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
