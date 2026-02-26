import { useEffect } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { getEntityProfile } from '../../../api/sentimentApi';

export function useEntityProfile(symbol: string | undefined) {
  const setActiveProfile = useSentimentStore((s) => s.setActiveProfile);
  const setActiveProfileSymbol = useSentimentStore((s) => s.setActiveProfileSymbol);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setActiveProfileSymbol(symbol);
    getEntityProfile(symbol)
      .then((data) => { if (!cancelled) setActiveProfile(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [symbol, setActiveProfile, setActiveProfileSymbol]);
}
