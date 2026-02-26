// Raw scores → 0-100 normalization utilities

/** Normalize raw sentiment (-1 to +1) to 0–100 scale */
export function normalizeRawSentiment(raw: number): number {
  return Math.round(((raw + 1) / 2) * 100);
}

/** Convert 0–100 score back to -1 to +1 */
export function denormalizeSentiment(score: number): number {
  return (score / 100) * 2 - 1;
}

/** Clamp a value to 0–100 */
export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Compute weighted average of component scores */
export function weightedAverage(
  components: { value: number; weight: number }[],
): number {
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return 50;
  const weighted = components.reduce((sum, c) => sum + c.value * c.weight, 0);
  return clampScore(weighted / totalWeight);
}

/** Compute composite sentiment from components */
export function computeComposite(components: {
  news: number;
  social: number;
  institutional: number;
  options: number;
  earnings: number;
  event: number;
}): number {
  return weightedAverage([
    { value: components.news, weight: 0.25 },
    { value: components.social, weight: 0.15 },
    { value: components.institutional, weight: 0.20 },
    { value: components.options, weight: 0.15 },
    { value: components.earnings, weight: 0.15 },
    { value: components.event, weight: 0.10 },
  ]);
}

/** Compute exponential decay weight for recency */
export function recencyWeight(hoursAgo: number, halfLife = 4): number {
  return Math.pow(0.5, hoursAgo / halfLife);
}
