import { useState, useEffect } from 'react';
import { getNewsFeed } from '../../../api/client';

interface NewsTabProps {
  symbol: string;
}

interface NewsItem {
  title: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  time: string;
  url?: string;
}

const SENTIMENT_ICONS: Record<string, string> = {
  positive: '\uD83D\uDFE2',
  negative: '\uD83D\uDD34',
  neutral: '\uD83D\uDFE1',
};

export function NewsTab({ symbol }: NewsTabProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNewsFeed(symbol)
      .then((data) => {
        if (Array.isArray(data?.articles)) {
          setNews(data.articles.slice(0, 10).map((a: Record<string, unknown>) => ({
            title: String(a.title ?? ''),
            sentiment: (a.sentiment as string) ?? 'neutral',
            time: String(a.published_at ?? a.time ?? ''),
            url: a.url as string | undefined,
          })));
        }
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return <div style={{ fontSize: 13, color: '#8b949e' }}>Loading news...</div>;
  }

  if (news.length === 0) {
    return <div style={{ fontSize: 13, color: '#8b949e' }}>No recent news for {symbol}.</div>;
  }

  return (
    <div className="sc-news-list">
      {news.map((item, idx) => (
        <div
          key={idx}
          className="sc-news-item"
          onClick={() => item.url && window.open(item.url, '_blank')}
        >
          <span className="sc-news-sentiment">{SENTIMENT_ICONS[item.sentiment] ?? SENTIMENT_ICONS.neutral}</span>
          <span className="sc-news-headline">{item.title}</span>
          <span className="sc-news-time">{item.time}</span>
        </div>
      ))}
    </div>
  );
}
