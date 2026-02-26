import { useEffect, useState } from 'react';
import { getEarningsProfile } from '../../../api/sentimentApi';
import type { EarningsProfile } from '../types/sentiment.types';

export function useEarningsProfile(symbol: string | undefined) {
  const [profile, setProfile] = useState<EarningsProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    getEarningsProfile(symbol)
      .then((data) => { if (!cancelled) setProfile(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol]);

  return { profile, loading };
}
