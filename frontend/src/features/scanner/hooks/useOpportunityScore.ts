import { useMemo } from 'react';
import type { ScoreBreakdown, ScoringConfig } from '../types/scanner.types';
import { getScoreLabel, getScoreColor } from '../utils/scoreCalculator';

export function useOpportunityScore(breakdown: ScoreBreakdown | null) {
  return useMemo(() => {
    if (!breakdown) {
      return {
        score: 0,
        label: 'N/A',
        color: '#8b949e',
        breakdown: null,
      };
    }

    return {
      score: breakdown.total,
      label: getScoreLabel(breakdown.total),
      color: getScoreColor(breakdown.total),
      breakdown,
    };
  }, [breakdown]);
}

export function useScoreWeightsNormalized(weights: ScoringConfig['weights']) {
  return useMemo(() => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (total === 0 || total === 1) return weights;
    const scale = 1 / total;
    return {
      signalStrength: Math.round(weights.signalStrength * scale * 100) / 100,
      historicalHitRate: Math.round(weights.historicalHitRate * scale * 100) / 100,
      regimeCompatibility: Math.round(weights.regimeCompatibility * scale * 100) / 100,
      portfolioFit: Math.round(weights.portfolioFit * scale * 100) / 100,
      recency: Math.round(weights.recency * scale * 100) / 100,
    };
  }, [weights]);
}
