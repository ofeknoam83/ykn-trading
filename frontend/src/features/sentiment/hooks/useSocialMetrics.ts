import { useEffect, useState } from 'react';
import { getSocialMetrics } from '../../../api/sentimentApi';
import type { SocialMetrics } from '../types/sentiment.types';

export function useSocialMetrics(symbol: string | undefined, window: '5m' | '1h' | '4h' | '1d' = '1h') {
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    getSocialMetrics(symbol, window)
      .then((data) => { if (!cancelled) setMetrics(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol, window]);

  return { metrics, loading };
}
