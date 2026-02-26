import { useEffect } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { sentimentColor } from '../utils/sentimentColorScale';
import { getTrendingSocial } from '../../../api/sentimentApi';

export function TrendingTickers() {
  const trendingTickers = useSentimentStore((s) => s.trendingTickers);
  const setTrendingTickers = useSentimentStore((s) => s.setTrendingTickers);

  useEffect(() => {
    getTrendingSocial()
      .then(setTrendingTickers)
      .catch(() => {});
  }, [setTrendingTickers]);

  const maxVolume = trendingTickers.reduce((max, t) => Math.max(max, t.volume), 1);

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Social Pulse &mdash; Trending</span>
      </div>
      <div className="sent-card-body">
        {trendingTickers.length === 0 ? (
          <div className="sent-empty">No trending tickers</div>
        ) : (
          trendingTickers.slice(0, 8).map((ticker, i) => (
            <div key={ticker.symbol} className="sent-trending-row">
              <span className="sent-trending-rank">{i + 1}.</span>
              <span className="sent-trending-ticker">${ticker.symbol}</span>
              <div className="sent-trending-bar">
                <div
                  className="sent-trending-fill"
                  style={{
                    width: `${(ticker.volume / maxVolume) * 100}%`,
                    background: sentimentColor(ticker.sentiment),
                  }}
                />
              </div>
              <span className="sent-trending-vol">{ticker.volume.toFixed(1)}x</span>
            </div>
          ))
        )}
      </div>
      <div className="sent-card-footer">
        <button className="sent-link" onClick={() => useSentimentStore.getState().setActiveView('social')}>
          View Social Dashboard &rarr;
        </button>
      </div>
    </div>
  );
}
