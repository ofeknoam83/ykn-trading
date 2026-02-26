import { useEffect, useState } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { SentimentAlertItem } from './SentimentAlertItem';
import { sentimentColor, changeColor } from '../utils/sentimentColorScale';
import { getSentimentWatchlist, addToSentimentWatchlist, removeFromSentimentWatchlist, getSentimentAlerts } from '../../../api/sentimentApi';

export function SentimentWatchlist() {
  const watchlist = useSentimentStore((s) => s.sentimentWatchlist);
  const setSentimentWatchlist = useSentimentStore((s) => s.setSentimentWatchlist);
  const removeFromWatchlist = useSentimentStore((s) => s.removeFromWatchlist);
  const sentimentAlerts = useSentimentStore((s) => s.sentimentAlerts);
  const [addSymbol, setAddSymbol] = useState('');
  const [tab, setTab] = useState<'watchlist' | 'alerts'>('watchlist');

  useEffect(() => {
    getSentimentWatchlist().then(setSentimentWatchlist).catch(() => {});
    getSentimentAlerts().then((d) => {
      d.alerts.forEach((a) => useSentimentStore.getState().addSentimentAlert(a));
    }).catch(() => {});
  }, [setSentimentWatchlist]);

  const handleAdd = () => {
    if (!addSymbol.trim()) return;
    addToSentimentWatchlist(addSymbol.trim().toUpperCase())
      .then((entry) => useSentimentStore.getState().addToWatchlist(entry))
      .catch(() => {});
    setAddSymbol('');
  };

  const handleRemove = (symbol: string) => {
    removeFromSentimentWatchlist(symbol)
      .then(() => removeFromWatchlist(symbol))
      .catch(() => {});
  };

  return (
    <div>
      <div className="sent-tabs">
        <button className={`sent-tab ${tab === 'watchlist' ? 'sent-tab--active' : ''}`} onClick={() => setTab('watchlist')}>
          Watchlist
        </button>
        <button className={`sent-tab ${tab === 'alerts' ? 'sent-tab--active' : ''}`} onClick={() => setTab('alerts')}>
          Alerts ({sentimentAlerts.filter((a) => !a.readAt).length})
        </button>
      </div>

      {tab === 'watchlist' && (
        <div className="sent-card">
          <div className="sent-card-header">
            <span className="sent-card-title">Sentiment Watchlist</span>
            <div className="sent-flex sent-gap-8">
              <input
                type="text"
                value={addSymbol}
                onChange={(e) => setAddSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Add symbol..."
                style={{ padding: '4px 8px', fontSize: 12, background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3', width: 120 }}
              />
              <button className="sent-nav-btn" onClick={handleAdd} style={{ padding: '4px 8px', fontSize: 11 }}>
                + Add
              </button>
            </div>
          </div>
          <div className="sent-card-body">
            {watchlist.length === 0 ? (
              <div className="sent-empty">Add symbols to track their sentiment</div>
            ) : (
              <table className="sent-watchlist-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Composite</th>
                    <th>News</th>
                    <th>Social</th>
                    <th>Inst.</th>
                    <th>24h Change</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((entry) => (
                    <tr key={entry.symbol}>
                      <td
                        style={{ color: '#58a6ff', fontWeight: 700, cursor: 'pointer' }}
                        onClick={() => {
                          useSentimentStore.getState().setActiveProfileSymbol(entry.symbol);
                          useSentimentStore.getState().setActiveView('profile');
                        }}
                      >
                        {entry.symbol}
                      </td>
                      <td>
                        <span className="sent-score-badge" style={{
                          background: `${sentimentColor(entry.composite)}20`,
                          color: sentimentColor(entry.composite),
                        }}>
                          {entry.composite}
                        </span>
                      </td>
                      <td style={{ color: sentimentColor(entry.news) }}>{entry.news}</td>
                      <td style={{ color: sentimentColor(entry.social) }}>{entry.social}</td>
                      <td style={{ color: sentimentColor(entry.institutional) }}>{entry.institutional}</td>
                      <td style={{ color: changeColor(entry.change24h), fontWeight: 600 }}>
                        {entry.change24h >= 0 ? '+' : ''}{entry.change24h}
                        {Math.abs(entry.change24h) > 15 && ' \u26A0\uFE0F'}
                      </td>
                      <td>
                        <button
                          className="sent-link"
                          style={{ color: '#f85149' }}
                          onClick={() => handleRemove(entry.symbol)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'alerts' && (
        <div className="sent-card">
          <div className="sent-card-header">
            <span className="sent-card-title">Sentiment Alerts</span>
          </div>
          <div className="sent-card-body">
            {sentimentAlerts.length === 0 ? (
              <div className="sent-empty">No alerts triggered</div>
            ) : (
              sentimentAlerts.map((alert) => (
                <SentimentAlertItem key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
