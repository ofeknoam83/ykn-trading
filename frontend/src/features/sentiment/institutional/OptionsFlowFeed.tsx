import { useEffect, useState } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { getOptionsFlow } from '../../../api/sentimentApi';

export function OptionsFlowFeed({ symbol: propSymbol }: { symbol?: string } = {}) {
  const optionsFlowFeed = useSentimentStore((s) => s.optionsFlowFeed);
  const setOptionsFlowFeed = useSentimentStore((s) => s.setOptionsFlowFeed);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOptionsFlow(propSymbol)
      .then((data) => { if (!cancelled) setOptionsFlowFeed(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [propSymbol, setOptionsFlowFeed]);

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Options Flow{propSymbol ? `: ${propSymbol}` : ''}</span>
      </div>
      <div className="sent-card-body">
        {loading ? (
          <div className="sent-loading">Loading options flow...</div>
        ) : optionsFlowFeed.length === 0 ? (
          <div className="sent-empty">No options flow data available</div>
        ) : (
          <table className="sent-options-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Strike</th>
                <th>Expiry</th>
                <th>Size</th>
                <th>Premium</th>
                <th>Class</th>
                <th>Signal</th>
              </tr>
            </thead>
            <tbody>
              {optionsFlowFeed.slice(0, 50).map((entry) => (
                <tr key={entry.id}>
                  <td className="sent-text-muted">
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ color: '#58a6ff', fontWeight: 600 }}>{entry.symbol}</td>
                  <td>
                    <span className={entry.type === 'call' ? 'sent-text-positive' : 'sent-text-negative'}>
                      {entry.type.toUpperCase()}
                    </span>
                  </td>
                  <td>${entry.strike}</td>
                  <td className="sent-text-muted">{new Date(entry.expiration).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td>{entry.size.toLocaleString()}</td>
                  <td>${(entry.premium / 1e3).toFixed(0)}K</td>
                  <td>
                    <span className={`sent-badge ${entry.classification === 'sweep' ? 'sent-badge--info' : 'sent-badge--neutral'}`}>
                      {entry.classification}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      color: entry.sentiment === 'bullish' ? '#3fb950' : entry.sentiment === 'bearish' ? '#f85149' : '#8b949e',
                      fontWeight: 600,
                    }}>
                      {entry.sentiment === 'bullish' ? '\u25B2' : entry.sentiment === 'bearish' ? '\u25BC' : '\u2014'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
