import { useEffect } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { getRecent13F, getInsiderClusters, getOptionsFlow } from '../../../api/sentimentApi';

export function InstitutionalHighlights() {
  const filing13FHighlights = useSentimentStore((s) => s.filing13FHighlights);
  const insiderClusters = useSentimentStore((s) => s.insiderClusters);
  const optionsFlowFeed = useSentimentStore((s) => s.optionsFlowFeed);
  const setFiling13FHighlights = useSentimentStore((s) => s.setFiling13FHighlights);
  const setInsiderClusters = useSentimentStore((s) => s.setInsiderClusters);
  const setOptionsFlowFeed = useSentimentStore((s) => s.setOptionsFlowFeed);

  useEffect(() => {
    getRecent13F().then(setFiling13FHighlights).catch(() => {});
    getInsiderClusters().then(setInsiderClusters).catch(() => {});
    getOptionsFlow().then(setOptionsFlowFeed).catch(() => {});
  }, [setFiling13FHighlights, setInsiderClusters, setOptionsFlowFeed]);

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Institutional Flow</span>
      </div>
      <div className="sent-card-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
        {/* 13F Highlights */}
        {filing13FHighlights.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div className="sent-text-sm sent-text-muted sent-font-bold sent-mb-8">13F Highlights</div>
            {filing13FHighlights.slice(0, 3).map((filing) => {
              const topBuy = filing.positions.filter((p) => p.action === 'new' || p.action === 'increased').slice(0, 2);
              return (
                <div key={filing.id} className="sent-flow-entry">
                  <span className="sent-flow-icon">{'\u{1F3E6}'}</span>
                  <span className="sent-flow-text">
                    <span style={{ fontWeight: 600 }}>{filing.managerName}</span>
                    {topBuy.map((p) => (
                      <span key={p.symbol}> {'\u25B2'} <span className="sent-flow-symbol">{p.symbol}</span> {p.action === 'new' ? 'new position' : `+${p.changePct.toFixed(0)}%`}</span>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Insider Clusters */}
        {insiderClusters.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div className="sent-text-sm sent-text-muted sent-font-bold sent-mb-8">
              Cluster Buys Detected: {insiderClusters.filter((c) => c.type === 'buy').length} stocks
            </div>
            {insiderClusters.filter((c) => c.type === 'buy').slice(0, 3).map((cluster) => (
              <div key={cluster.symbol} className="sent-flow-entry">
                <span className="sent-flow-icon">{'\u{1F464}'}</span>
                <span className="sent-flow-text">
                  <span className="sent-flow-symbol">{cluster.symbol}</span>{' '}
                  {cluster.insiderCount} insiders bought &middot; ${(cluster.totalValue / 1e6).toFixed(1)}M
                  {cluster.transactions.slice(0, 2).map((t) => (
                    <span key={t.id} className="sent-text-muted"> &middot; {t.insiderTitle}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Options Flow */}
        {optionsFlowFeed.length > 0 && (
          <div>
            <div className="sent-text-sm sent-text-muted sent-font-bold sent-mb-8">Unusual Options Activity</div>
            {optionsFlowFeed.filter((f) => f.classification === 'sweep' || f.classification === 'block').slice(0, 3).map((entry) => (
              <div key={entry.id} className="sent-flow-entry">
                <span className="sent-flow-icon">{'\u{1F4CA}'}</span>
                <span className="sent-flow-text">
                  <span className="sent-flow-symbol">{entry.symbol}</span>{' '}
                  {entry.type === 'call' ? 'Call' : 'Put'} {entry.classification}{' '}
                  ${entry.strike} {new Date(entry.expiration).toLocaleDateString('en-US', { month: 'short' })} expiry{' '}
                  ${(entry.premium / 1e6).toFixed(1)}M premium{' '}
                  <span style={{ color: entry.sentiment === 'bullish' ? '#3fb950' : entry.sentiment === 'bearish' ? '#f85149' : '#8b949e' }}>
                    {entry.sentiment === 'bullish' ? '\u{1F7E2}' : entry.sentiment === 'bearish' ? '\u{1F534}' : '\u{1F7E1}'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {filing13FHighlights.length === 0 && insiderClusters.length === 0 && optionsFlowFeed.length === 0 && (
          <div className="sent-empty">No institutional data available</div>
        )}
      </div>
      <div className="sent-card-footer">
        <button className="sent-link" onClick={() => useSentimentStore.getState().setActiveView('institutional')}>
          View All Activity &rarr;
        </button>
      </div>
    </div>
  );
}
