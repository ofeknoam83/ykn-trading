import { useState, useEffect } from 'react';
import { getInsiderTransactions, getInsiderClusters } from '../../../api/sentimentApi';
import { useSentimentStore } from '../stores/sentimentStore';
import type { InsiderTransaction } from '../types/sentiment.types';

export function InsiderTransactionList({ symbol: propSymbol }: { symbol?: string } = {}) {
  const [symbol, setSymbol] = useState(propSymbol || '');
  const [transactions, setTransactions] = useState<InsiderTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const insiderClusters = useSentimentStore((s) => s.insiderClusters);
  const setInsiderClusters = useSentimentStore((s) => s.setInsiderClusters);

  useEffect(() => {
    getInsiderClusters().then(setInsiderClusters).catch(() => {});
  }, [setInsiderClusters]);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    getInsiderTransactions(symbol)
      .then((data) => { if (!cancelled) setTransactions(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol]);

  return (
    <div>
      {/* Cluster Alerts */}
      {insiderClusters.length > 0 && (
        <div className="sent-card sent-mb-16">
          <div className="sent-card-header">
            <span className="sent-card-title">Cluster Buy/Sell Detections</span>
          </div>
          <div className="sent-card-body">
            {insiderClusters.map((cluster) => (
              <div key={cluster.symbol} className="sent-flow-entry">
                <span className={`sent-badge ${cluster.type === 'buy' ? 'sent-badge--bullish' : 'sent-badge--bearish'}`}>
                  Cluster {cluster.type}
                </span>
                <span className="sent-flow-symbol" style={{ marginLeft: 8 }}>{cluster.symbol}</span>
                <span className="sent-text-muted" style={{ marginLeft: 8 }}>
                  {cluster.insiderCount} insiders &middot; ${(cluster.totalValue / 1e6).toFixed(1)}M
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Search */}
      {!propSymbol && (
        <div className="sent-flex sent-gap-8 sent-mb-16">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter symbol (e.g., AAPL)"
            style={{ padding: '6px 12px', fontSize: 13, background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', width: 200 }}
          />
        </div>
      )}

      {symbol && (
        <div className="sent-card">
          <div className="sent-card-header">
            <span className="sent-card-title">Insider Transactions: {symbol}</span>
          </div>
          <div className="sent-card-body">
            {loading ? (
              <div className="sent-loading">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="sent-empty">No insider transactions found</div>
            ) : (
              <table className="sent-options-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Insider</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Shares</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
                      <td>{tx.insiderName}</td>
                      <td className="sent-text-muted">{tx.insiderTitle}</td>
                      <td>
                        <span className={`sent-badge ${tx.transactionType === 'buy' ? 'sent-badge--bullish' : tx.transactionType === 'sell' ? 'sent-badge--bearish' : 'sent-badge--neutral'}`}>
                          {tx.transactionType}
                        </span>
                      </td>
                      <td>{tx.shares.toLocaleString()}</td>
                      <td>${(tx.totalValue / 1e6).toFixed(2)}M</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
