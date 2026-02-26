import { useEffect } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { getEventTimeline } from '../../../api/sentimentApi';

export function useEventTimeline(symbol?: string) {
  const setEventTimeline = useSentimentStore((s) => s.setEventTimeline);

  useEffect(() => {
    let cancelled = false;
    getEventTimeline(symbol ? { symbol } : undefined)
      .then((data) => { if (!cancelled) setEventTimeline(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [symbol, setEventTimeline]);
}
