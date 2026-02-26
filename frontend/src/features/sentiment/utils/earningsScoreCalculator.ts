// Earnings opportunity score calculation

import type { EarningsProfile } from '../types/sentiment.types';

export interface EarningsScoreBreakdown {
  beatProbability: number;
  revisionMomentum: number;
  optionsValue: number;
  sentimentContrarian: number;
  total: number;
  label: string;
}

export function computeEarningsScore(profile: EarningsProfile): EarningsScoreBreakdown {
  // Beat probability: based on historical beat rate + whisper vs consensus
  const beatRate = profile.beatRate.eps.pct / 100;
  const whisperGap = profile.epsWhisper
    ? Math.min(1, Math.max(0, (profile.epsWhisper - profile.epsEstimate) / Math.abs(profile.epsEstimate || 1) * 5))
    : 0;
  const revisionTrendBonus = profile.analystRevisionTrend === 'up' ? 0.15
    : profile.analystRevisionTrend === 'down' ? -0.15
    : 0;
  const beatProbability = Math.min(100, Math.max(0,
    (beatRate + whisperGap + revisionTrendBonus) * 100 / 1.15
  ));

  // Revision momentum: net upward revisions
  const totalRevisions = profile.estimateRevisions.epsUp + profile.estimateRevisions.epsDown;
  const revisionMomentum = totalRevisions > 0
    ? (profile.estimateRevisions.epsUp / totalRevisions) * 100
    : 50;

  // Options value: implied vs realized
  const optionsValue = profile.impliedVsRealized < 1.0
    ? Math.min(100, (1.0 - profile.impliedVsRealized) * 200 + 60)
    : Math.max(0, 60 - (profile.impliedVsRealized - 1.0) * 100);

  // Sentiment contrarian: low pre-earnings sentiment + high beat probability
  const sentimentContrarian = profile.preEarningsSentiment < 40 && beatProbability > 65
    ? Math.min(100, (65 - profile.preEarningsSentiment) + beatProbability)
    : profile.preEarningsSentiment > 75 && beatProbability < 40
    ? Math.max(0, 100 - (profile.preEarningsSentiment - 40))
    : 50;

  const total = Math.round(
    beatProbability * 0.35 +
    revisionMomentum * 0.25 +
    optionsValue * 0.20 +
    sentimentContrarian * 0.20
  );

  const label = total >= 80 ? 'Strong Opportunity'
    : total >= 60 ? 'Opportunity'
    : total >= 40 ? 'Neutral'
    : total >= 20 ? 'Risk'
    : 'High Risk';

  return {
    beatProbability: Math.round(beatProbability),
    revisionMomentum: Math.round(revisionMomentum),
    optionsValue: Math.round(optionsValue),
    sentimentContrarian: Math.round(sentimentContrarian),
    total,
    label,
  };
}
