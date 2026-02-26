import type { ScoreBreakdown, ScoringConfig, ConditionMatch } from '../types/scanner.types';

const DEFAULT_WEIGHTS: ScoringConfig['weights'] = {
  signalStrength: 0.30,
  historicalHitRate: 0.25,
  regimeCompatibility: 0.20,
  portfolioFit: 0.15,
  recency: 0.10,
};

export function computeScore(params: {
  signalStrength: number;
  historicalHitRate: number | null;
  regimeCompatibility: number;
  portfolioFit: number | null;
  minutesSinceMatch: number;
  weights?: ScoringConfig['weights'];
}): ScoreBreakdown {
  const weights = params.weights ?? DEFAULT_WEIGHTS;

  // Reweight if components are unavailable
  let activeWeights = { ...weights };
  if (params.historicalHitRate === null) {
    activeWeights.historicalHitRate = 0;
  }
  if (params.portfolioFit === null) {
    activeWeights.portfolioFit = 0;
  }

  // Normalize weights to sum to 1.0
  const totalWeight = Object.values(activeWeights).reduce((a, b) => a + b, 0);
  if (totalWeight > 0 && totalWeight !== 1) {
    const scale = 1 / totalWeight;
    activeWeights = {
      signalStrength: activeWeights.signalStrength * scale,
      historicalHitRate: activeWeights.historicalHitRate * scale,
      regimeCompatibility: activeWeights.regimeCompatibility * scale,
      portfolioFit: activeWeights.portfolioFit * scale,
      recency: activeWeights.recency * scale,
    };
  }

  // Recency boost: decays 2 points per minute, zeroes at 50 minutes
  const recencyRaw = Math.max(0, 100 - params.minutesSinceMatch * 2);

  const signalRaw = clamp(params.signalStrength, 0, 100);
  const hitRateRaw = clamp(params.historicalHitRate ?? 0, 0, 100);
  const regimeRaw = clamp(params.regimeCompatibility, 0, 100);
  const portfolioRaw = clamp(params.portfolioFit ?? 0, 0, 100);

  const breakdown: ScoreBreakdown = {
    signalStrength: {
      raw: signalRaw,
      weighted: round(signalRaw * activeWeights.signalStrength),
    },
    historicalHitRate: {
      raw: hitRateRaw,
      weighted: round(hitRateRaw * activeWeights.historicalHitRate),
    },
    regimeCompatibility: {
      raw: regimeRaw,
      weighted: round(regimeRaw * activeWeights.regimeCompatibility),
    },
    portfolioFit: {
      raw: portfolioRaw,
      weighted: round(portfolioRaw * activeWeights.portfolioFit),
    },
    recency: {
      raw: recencyRaw,
      weighted: round(recencyRaw * activeWeights.recency),
    },
    total: 0,
  };

  breakdown.total = Math.round(
    breakdown.signalStrength.weighted +
    breakdown.historicalHitRate.weighted +
    breakdown.regimeCompatibility.weighted +
    breakdown.portfolioFit.weighted +
    breakdown.recency.weighted
  );

  return breakdown;
}

export function averageSignalStrength(matches: ConditionMatch[]): number {
  if (matches.length === 0) return 0;
  const total = matches.reduce((sum, m) => sum + m.strength, 0);
  return Math.round(total / matches.length);
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Weak';
  return 'Low confidence';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#3fb950';
  if (score >= 60) return '#58a6ff';
  if (score >= 40) return '#d29922';
  return '#8b949e';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
