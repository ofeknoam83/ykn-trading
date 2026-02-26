import { useEffect } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { getNewsSentimentFeed } from '../../../api/sentimentApi';

export function useNewsFeed(symbol?: string) {
  const setNewsFeed = useSentimentStore((s) => s.setNewsFeed);
  const setNewsFeedLoading = useSentimentStore((s) => s.setNewsFeedLoading);
  const newsFeedFilters = useSentimentStore((s) => s.newsFeedFilters);

  useEffect(() => {
    let cancelled = false;
    setNewsFeedLoading(true);
    const filters = symbol ? { ...newsFeedFilters, symbol } : newsFeedFilters;
    getNewsSentimentFeed(filters)
      .then((data) => { if (!cancelled) setNewsFeed(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setNewsFeedLoading(false); });
    return () => { cancelled = true; };
  }, [symbol, newsFeedFilters, setNewsFeed, setNewsFeedLoading]);
}
