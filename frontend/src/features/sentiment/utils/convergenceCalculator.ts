// Cross-signal convergence computation

import type { ConvergenceType } from '../types/sentiment.types';

export interface ConvergenceResult {
  score: number;         // -1 to +1
  type: ConvergenceType;
  description: string;
}

/**
 * Compute convergence between quantitative and sentiment signals.
 * Both signals on 0–100 scale where 50 is neutral.
 */
export function computeConvergence(
  quantSignal: number,
  sentimentSignal: number,
  institutionalSignal?: number,
): ConvergenceResult {
  const quantStrength = Math.abs(quantSignal - 50) / 50;
  const sentStrength = Math.abs(sentimentSignal - 50) / 50;

  const quantDirection = quantSignal >= 50 ? 1 : -1;
  const sentDirection = sentimentSignal >= 50 ? 1 : -1;
  const directionMatch = quantDirection === sentDirection ? 1 : -1;

  const score = quantStrength * sentStrength * directionMatch;

  // Determine type
  let type: ConvergenceType;
  let description: string;

  if (score > 0.6 && quantDirection > 0) {
    type = 'full_bullish';
    description = 'Full bullish convergence: quantitative and sentiment signals aligned positively.';
  } else if (score > 0.6 && quantDirection < 0) {
    type = 'full_bearish';
    description = 'Full bearish convergence: quantitative and sentiment signals aligned negatively.';
  } else if (score < -0.4 && institutionalSignal !== undefined && institutionalSignal > 65) {
    type = 'smart_money_divergence';
    description = 'Smart money divergence: institutions buying while price/sentiment weak.';
  } else if (score < -0.4 && sentimentSignal > 75) {
    type = 'crowd_fade';
    description = 'Crowd fade: extreme social/sentiment bullishness against weak technicals.';
  } else if (score > 0.3 && sentimentSignal > 60) {
    type = 'catalyst_setup';
    description = 'Catalyst setup: positive sentiment arriving at technical inflection point.';
  } else if (score < -0.3) {
    type = 'divergent';
    description = 'Signal divergence: quantitative and sentiment signals disagree.';
  } else {
    type = 'neutral';
    description = 'Neutral: signals are weak or mixed, low conviction.';
  }

  return { score: Math.round(score * 100) / 100, type, description };
}

/** Get a human-friendly label for convergence type */
export function convergenceLabel(type: ConvergenceType): string {
  const labels: Record<ConvergenceType, string> = {
    full_bullish: 'Full Bullish',
    full_bearish: 'Full Bearish',
    smart_money_divergence: 'Smart Money Divergence',
    crowd_fade: 'Crowd Fade',
    catalyst_setup: 'Catalyst Setup',
    divergent: 'Divergent',
    neutral: 'Neutral',
  };
  return labels[type];
}
