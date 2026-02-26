import { useState, useEffect } from 'react';
import { SocialVolumeChart } from './SocialVolumeChart';
import { PlatformBreakdown } from './PlatformBreakdown';
import { NarrativeSummary } from './NarrativeSummary';
import { SocialAnomalyBadge } from './SocialAnomalyBadge';
import { TrendingTickers } from './TrendingTickers';
import { sentimentColor, sentimentLabel } from '../utils/sentimentColorScale';
import { getSocialMetrics } from '../../../api/sentimentApi';
import type { SocialMetrics } from '../types/sentiment.types';

export function SocialPulse({ symbol: propSymbol }: { symbol?: string } = {}) {
  const [symbol, setSymbol] = useState(propSymbol || '');
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    getSocialMetrics(symbol)
      .then((data) => { if (!cancelled) setMetrics(data); })
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
            placeholder="Enter symbol (e.g., NVDA)"
            style={{ padding: '6px 12px', fontSize: 13, background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', width: 200 }}
          />
        </div>
      )}

      {!symbol ? (
        <TrendingTickers />
      ) : loading ? (
        <div className="sent-loading">Loading social data for {symbol}...</div>
      ) : !metrics ? (
        <div className="sent-empty">No social data available for {symbol}</div>
      ) : (
        <div>
          <div className="sent-card sent-mb-16">
            <div className="sent-card-header">
              <span className="sent-card-title">Social Pulse: {symbol}</span>
              <SocialAnomalyBadge botFilteredPct={metrics.botFilteredPct} />
            </div>
            <div className="sent-card-body">
              <div className="sent-flex sent-gap-16" style={{ marginBottom: 12 }}>
                <div>
                  <span className="sent-text-muted sent-text-sm">Volume</span>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {metrics.mentionCount.toLocaleString()} mentions ({metrics.relativeVolume.toFixed(1)}x avg)
                    {metrics.volumeAcceleration > 0 && <span className="sent-text-positive"> &#9650; accelerating</span>}
                    {metrics.volumeAcceleration < 0 && <span className="sent-text-negative"> &#9660; decelerating</span>}
                  </div>
                </div>
                <div>
                  <span className="sent-text-muted sent-text-sm">Sentiment</span>
                  <div style={{ fontSize: 15, fontWeight: 600, color: sentimentColor(metrics.sentimentScore) }}>
                    {sentimentLabel(metrics.sentimentScore)} ({metrics.sentimentScore})
                  </div>
                  <div className="sent-text-sm sent-text-muted">
                    {metrics.bullishPct.toFixed(0)}% bullish, {metrics.bearishPct.toFixed(0)}% bearish, {metrics.neutralPct.toFixed(0)}% neutral
                  </div>
                </div>
              </div>

              <SocialVolumeChart symbol={symbol} />
            </div>
          </div>

          <div className="sent-grid-2">
            <PlatformBreakdown platforms={metrics.platformBreakdown} />
            <NarrativeSummary
              narrative={metrics.dominantNarrative}
              keywords={metrics.topKeywords}
            />
          </div>
        </div>
      )}
    </div>
  );
}
