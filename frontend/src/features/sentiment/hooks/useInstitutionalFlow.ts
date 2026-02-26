import { useEffect, useState } from 'react';
import { getInstitutionalFlow } from '../../../api/sentimentApi';

interface InstitutionalData {
  ownership: { totalInstitutionalShares: number; institutionalPct: number; quarterlyChange: number; netBuyers: number; netSellers: number };
  recentInsider: unknown[];
  optionsFlow: unknown[];
  darkPool: unknown;
}

export function useInstitutionalFlow(symbol: string | undefined) {
  const [data, setData] = useState<InstitutionalData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    getInstitutionalFlow(symbol)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol]);

  return { data, loading };
}
