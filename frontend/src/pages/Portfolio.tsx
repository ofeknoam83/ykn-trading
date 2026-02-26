import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPositions, getAccount, getOrders, placeOrder } from '../api/client';
import { AssetPicker } from '../components/pickers/AssetPicker';

const PAPER_KEY = 'ykn_trading_paper_mode';

function getPaperMode(): boolean {
  try {
    return localStorage.getItem(PAPER_KEY) !== 'false';
  } catch {
    return true;
  }
}

function setPaperMode(v: boolean) {
  try {
    localStorage.setItem(PAPER_KEY, String(v));
  } catch {}
}

function extractTickerFromText(text: string): string {
  const match = text.match(/\b([A-Z]{2,5})\b/);
  return match ? match[1] : '';
}

export function Portfolio() {
  const location = useLocation();
  const tradeFromNews = (location.state as { tradeFromNews?: string })?.tradeFromNews;
  const [paperMode, setPaperModeState] = useState(getPaperMode);
  const [positions, setPositions] = useState<{ symbol: string; qty: number; avg_cost?: number }[]>([]);
  const [account, setAccount] = useState<{ cash?: number; equity?: number }>({});
  const [orders, setOrders] = useState<{ id?: string; symbol: string; side: string; qty: number; status?: string }[]>([]);
  const [orderSymbol, setOrderSymbol] = useState('');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderQty, setOrderQty] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  function togglePaper() {
    const next = !paperMode;
    setPaperModeState(next);
    setPaperMode(next);
  }

  useEffect(() => {
    if (tradeFromNews) {
      const ticker = extractTickerFromText(tradeFromNews);
      if (ticker) setOrderSymbol(ticker);
    }
  }, [tradeFromNews]);

  useEffect(() => {
    getPositions().then((r) => setPositions(r.positions || [])).catch(() => {});
    getAccount().then(setAccount).catch(() => {});
    getOrders().then((r) => setOrders(r.orders || [])).catch(() => {});
  }, []);

  async function handlePlaceOrder() {
    const qty = parseFloat(orderQty);
    if (!orderSymbol || !Number.isFinite(qty) || qty <= 0) {
      setOrderError('Invalid symbol or quantity');
      return;
    }
    setOrderError(null);
    setOrderSubmitting(true);
    try {
      await placeOrder({
        symbol: orderSymbol,
        side: orderSide,
        qty,
        order_type: 'market',
      });
      setOrderSymbol('');
      setOrderQty('');
      getPositions().then((r) => setPositions(r.positions || [])).catch(() => {});
      getAccount().then(setAccount).catch(() => {});
      getOrders().then((r) => setOrders(r.orders || [])).catch(() => {});
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : 'Order failed');
    } finally {
      setOrderSubmitting(false);
    }
  }

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h2>Portfolio</h2>
        <div className="paper-toggle">
          <button
            type="button"
            className={`paper-btn ${paperMode ? 'active' : ''}`}
            onClick={togglePaper}
          >
            Paper
          </button>
          <button
            type="button"
            className={`paper-btn ${!paperMode ? 'active' : ''}`}
            onClick={togglePaper}
          >
            Live
          </button>
          <span className="paper-badge">{paperMode ? 'Paper trading' : 'Live'}</span>
        </div>
      </div>

      <div className="account-section">
        <h3>Account</h3>
        <div className="account-cards">
          <div className="account-card">
            <span className="label">Cash</span>
            <span className="value">${(account.cash ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="account-card">
            <span className="label">Equity</span>
            <span className="value">${(account.equity ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="order-section">
        <h3>Place Order</h3>
        <div className="order-form">
          <label>
            Symbol
            <AssetPicker value={orderSymbol} onChange={(s) => setOrderSymbol(s)} placeholder="Search symbol..." />
          </label>
          <label>
            Side
            <select
              value={orderSide}
              onChange={(e) => setOrderSide(e.target.value as 'buy' | 'sell')}
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="0.0001"
              step="0.01"
              value={orderQty}
              onChange={(e) => setOrderQty(e.target.value)}
              placeholder="0"
            />
          </label>
          <button onClick={handlePlaceOrder} disabled={orderSubmitting}>
            {orderSubmitting ? 'Submitting...' : 'Submit Order'}
          </button>
        </div>
        {orderError && <p className="order-error">{orderError}</p>}
        {paperMode && <p className="paper-hint">Orders execute in paper mode (simulated).</p>}
      </div>

      <div className="positions-section">
        <h3>Positions</h3>
        {positions.length === 0 ? (
          <p className="empty">No positions</p>
        ) : (
          <table className="positions-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.symbol}>
                  <td>{p.symbol}</td>
                  <td>{p.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {orders.length > 0 && (
        <div className="orders-section">
          <h3>Recent Orders</h3>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o, i) => (
                <tr key={o.id ?? i}>
                  <td>{o.symbol}</td>
                  <td>{o.side}</td>
                  <td>{o.qty}</td>
                  <td>{o.status ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
