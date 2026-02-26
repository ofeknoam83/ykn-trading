import { useSentimentStore } from '../stores/sentimentStore';
import { computeConvergence } from '../utils/convergenceCalculator';
import type { CompositeSentiment } from '../types/sentiment.types';

export function useConvergence() {
  const convergenceAlerts = useSentimentStore((s) => s.convergenceAlerts);

  return {
    convergenceAlerts,
    computeForSymbol: (quantSignal: number, profile: CompositeSentiment) => {
      return computeConvergence(quantSignal, profile.composite, profile.components.institutional);
    },
  };
}
