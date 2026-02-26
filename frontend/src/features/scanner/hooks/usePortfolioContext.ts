import { useState, useCallback } from 'react';
import * as scannerApi from '../../../api/scannerApi';
import type { PortfolioImpact } from '../types/scanner.types';

export function usePortfolioContext() {
  const [impact, setImpact] = useState<PortfolioImpact | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchImpact = useCallback(async (symbol: string, positionSize: number) => {
    setLoading(true);
    try {
      const data = await scannerApi.getPortfolioImpact(symbol, positionSize);
      setImpact(data);
      return data;
    } catch {
      setImpact(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearImpact = useCallback(() => {
    setImpact(null);
  }, []);

  return { impact, loading, fetchImpact, clearImpact };
}
