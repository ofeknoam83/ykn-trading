import { useState, useEffect } from 'react';
import { getDarkPool } from '../../../api/sentimentApi';
import type { DarkPoolSummary } from '../types/sentiment.types';

export function DarkPoolSummaryPanel({ symbol: propSymbol }: { symbol?: string } = {}) {
  const [symbol, setSymbol] = useState(propSymbol || '');
  const [data, setData] = useState<DarkPoolSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    getDarkPool(symbol)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol]);

  return (
    <div>
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

      {!symbol ? (
        <div className="sent-empty">Enter a symbol to view dark pool activity</div>
      ) : loading ? (
        <div className="sent-loading">Loading dark pool data...</div>
      ) : !data ? (
        <div className="sent-empty">No dark pool data available for {symbol}</div>
      ) : (
        <div className="sent-card">
          <div className="sent-card-header">
            <span className="sent-card-title">Dark Pool Activity: {symbol}</span>
          </div>
          <div className="sent-card-body">
            <div className="sent-earnings-grid">
              <div>
                <div className="sent-earnings-label">Total Dark Volume</div>
                <div className="sent-earnings-value">{(data.totalDarkVolume / 1e6).toFixed(1)}M shares</div>
              </div>
              <div>
                <div className="sent-earnings-label">Dark Pool %</div>
                <div className="sent-earnings-value">{data.darkPoolPct.toFixed(1)}%</div>
              </div>
              <div>
                <div className="sent-earnings-label">Avg Print Size</div>
                <div className="sent-earnings-value">{data.avgPrintSize.toLocaleString()} shares</div>
              </div>
              <div>
                <div className="sent-earnings-label">Large Prints (&gt;$1M)</div>
                <div className="sent-earnings-value">{data.largePrints}</div>
              </div>
              <div>
                <div className="sent-earnings-label">Net Sentiment</div>
                <div className="sent-earnings-value" style={{ color: data.netSentiment >= 0 ? '#3fb950' : '#f85149' }}>
                  {data.netSentiment >= 0 ? 'Above-ask dominated' : 'Below-bid dominated'} ({data.netSentiment.toFixed(2)})
                </div>
              </div>
              <div>
                <div className="sent-earnings-label">Short % of Volume</div>
                <div className="sent-earnings-value">{data.shortPctOfVolume.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
