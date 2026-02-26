import { memo, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getQuotes, getNewsFeed, getHistorical } from '../api/client';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const REGIONS = [
  {
    name: 'Americas',
    markets: [
      { symbol: 'SPY', name: 'S&P 500 ETF', description: '500 largest US companies.' },
      { symbol: 'QQQ', name: 'NASDAQ 100', description: 'Top 100 non-financial Nasdaq.' },
      { symbol: '^GSPC', name: 'S&P 500 Index', description: 'Large-cap US benchmark.' },
      { symbol: '^IXIC', name: 'NASDAQ Composite', description: 'All Nasdaq-listed stocks.' },
      { symbol: '^DJI', name: 'Dow Jones', description: '30 large US industrial stocks.' },
    ],
  },
  {
    name: 'Europe',
    markets: [
      { symbol: '^GDAXI', name: 'DAX', description: 'German blue-chip index.' },
      { symbol: '^FTSE', name: 'FTSE 100', description: 'UK large-cap index.' },
      { symbol: '^FCHI', name: 'CAC 40', description: 'French stock index.' },
    ],
  },
  {
    name: 'Asia-Pacific',
    markets: [
      { symbol: '^N225', name: 'Nikkei 225', description: 'Japanese stock index.' },
      { symbol: '^HSI', name: 'Hang Seng', description: 'Hong Kong stock index.' },
      { symbol: '^AXJO', name: 'ASX 200', description: 'Australian stock index.' },
    ],
  },
  {
    name: 'Crypto',
    markets: [
      { symbol: 'BTC-USD', name: 'Bitcoin', description: 'Leading cryptocurrency.' },
      { symbol: 'ETH-USD', name: 'Ethereum', description: 'Smart contracts & DeFi.' },
    ],
  },
];

const NEWS_CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'equities', label: 'Equities' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'macro', label: 'Macro' },
];

const ALL_SYMBOLS = REGIONS.flatMap((r) => r.markets.map((m) => m.symbol));

interface NewsHeadline {
  title: string;
  source: string;
  timestamp?: string;
  url?: string;
  image?: string | null;
}

const Sparkline = memo(function Sparkline({ symbol }: { symbol: string }) {
  const [data, setData] = useState<{ t: string; close: number }[]>([]);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 5);
    getHistorical(symbol, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10), '1d')
      .then((r) => {
        const d = (r.data || []).map((x: { bucket: string; close?: number; Close?: number }) => ({
          t: x.bucket,
          close: x.close ?? x.Close ?? 0,
        }));
        setData(d);
      })
      .catch(() => setData([]));
  }, [symbol]);

  if (data.length < 2) return null;

  return (
    <div className="sparkline">
      <ResponsiveContainer width="100%" height={32}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="close" stroke="#58a6ff" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

const MarketCard = memo(function MarketCard({
  market,
  quote,
  isLoading,
}: {
  market: { symbol: string; name: string; description: string };
  quote: { price: number; change_percent?: number } | undefined;
  isLoading?: boolean;
}) {
  const p = Number(quote?.price);
  const priceStr =
    isLoading || quote == null || !Number.isFinite(p)
      ? '—'
      : `$${p.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  return (
    <Link to={`/chart/${market.symbol}`} className="market-card-link">
      <div className="market-card">
        <div className="symbol">{market.symbol}</div>
        <div className="market-name">{market.name}</div>
        <div className="price">{priceStr}</div>
        {quote?.change_percent != null && (
          <div className={quote.change_percent >= 0 ? 'change-up' : 'change-down'}>
            {quote.change_percent >= 0 ? '+' : ''}
            {quote.change_percent?.toFixed(2)}%
          </div>
        )}
        <Sparkline symbol={market.symbol} />
        <p className="market-description">{market.description}</p>
      </div>
    </Link>
  );
});

export function Dashboard() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Record<string, { price: number; change_percent?: number }>>({});
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [news, setNews] = useState<NewsHeadline[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsCategory, setNewsCategory] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    async function loadPrices() {
      setPriceError(null);
      try {
        const res = await getQuotes(ALL_SYMBOLS);
        setQuotes(res.quotes ?? {});
        setLastUpdate(new Date());
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load prices';
        setPriceError(msg);
        console.error('getQuotes failed:', e);
      } finally {
        setPriceLoading(false);
      }
    }
    loadPrices();
    const t = setInterval(loadPrices, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let isFirst = true;
    async function loadNews() {
      if (isFirst) setNewsLoading(true);
      setNewsError(null);
      try {
        const res = await getNewsFeed(newsCategory || undefined);
        setNews(res.headlines || []);
        setLastUpdate(new Date());
      } catch (e) {
        setNewsError(e instanceof Error ? e.message : 'Failed to load news');
        setNews([]);
      } finally {
        setNewsLoading(false);
        isFirst = false;
      }
    }
    loadNews();
    const t = setInterval(loadNews, 30000);
    return () => clearInterval(t);
  }, [newsCategory]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Global Markets</h2>
        <span className="market-hours">US 9:30–16:00 ET · EU 8:00–16:30 CET · Asia varies</span>
        {priceError && (
          <span className="price-error" role="alert">
            {priceError}
          </span>
        )}
        {lastUpdate && !priceError && (
          <span className="last-update">
            Updated {lastUpdate.toLocaleTimeString()} · Next refresh in 30s
          </span>
        )}
      </div>

      <div className="market-regions">
        {REGIONS.map((region) => (
          <section key={region.name} className="market-region">
            <h3 className="region-title">{region.name}</h3>
            <div className="market-grid">
              {region.markets.map((m) => (
                <MarketCard
                  key={m.symbol}
                  market={m}
                  quote={quotes[m.symbol]}
                  isLoading={priceLoading}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="dashboard-news" aria-label="News">
        <div className="news-header">
          <h3>Live News</h3>
          <div className="news-tabs">
            {NEWS_CATEGORIES.map((c) => (
              <button
                key={c.id || 'all'}
                type="button"
                className={newsCategory === c.id ? 'active' : ''}
                onClick={() => setNewsCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="news-panel">
          {newsLoading && <div className="news-loading">Loading news...</div>}
          {newsError && <div className="news-error">{newsError}</div>}
          {!newsLoading && !newsError && news.length === 0 && (
            <div className="news-empty">No headlines available</div>
          )}
          {!newsLoading && news.length > 0 && news.map((h, i) => (
            <div key={i} className="news-item-wrapper">
              <a href={h.url || '#'} target="_blank" rel="noopener noreferrer" className="news-item">
                {h.image && (
                  <img src={h.image} alt="" className="news-item-image" loading="lazy" />
                )}
                <div className="news-item-content">
                  <span className="news-item-title">{h.title}</span>
                  <span className="source">{h.source}</span>
                </div>
              </a>
              <button
                type="button"
                className="news-trade-btn"
                onClick={() => navigate('/portfolio', { state: { tradeFromNews: h.title } })}
              >
                Trade
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
