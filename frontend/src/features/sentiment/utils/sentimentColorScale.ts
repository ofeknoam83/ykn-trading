// Sentiment score → color mapping utilities

/** Returns a CSS color for a sentiment score (0–100 scale) */
export function sentimentColor(score: number): string {
  if (score >= 70) return '#3fb950';
  if (score >= 60) return '#56d364';
  if (score >= 40) return '#d29922';
  if (score >= 30) return '#f85149';
  return '#da3633';
}

/** Returns a CSS color for a raw sentiment value (-1 to +1 scale) */
export function rawSentimentColor(value: number): string {
  if (value >= 0.5) return '#3fb950';
  if (value >= 0.2) return '#56d364';
  if (value >= -0.19) return '#d29922';
  if (value >= -0.49) return '#f85149';
  return '#da3633';
}

/** Returns a sentiment indicator emoji for raw sentiment (-1 to +1) */
export function sentimentIndicator(value: number): string {
  if (value >= 0.2) return '\u{1F7E2}';
  if (value >= -0.19) return '\u{1F7E1}';
  return '\u{1F534}';
}

/** Returns a label for a 0–100 sentiment score */
export function sentimentLabel(score: number): string {
  if (score >= 80) return 'Very Bullish';
  if (score >= 65) return 'Bullish';
  if (score >= 55) return 'Cautiously Bullish';
  if (score >= 45) return 'Neutral';
  if (score >= 35) return 'Cautiously Bearish';
  if (score >= 20) return 'Bearish';
  return 'Very Bearish';
}

/** Returns background color with opacity for sentiment zones */
export function sentimentBgColor(score: number, opacity = 0.15): string {
  const base = sentimentColor(score);
  return `${base}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

/** Returns text class for positive/negative change */
export function changeColor(change: number): string {
  if (change > 0) return '#3fb950';
  if (change < 0) return '#f85149';
  return '#8b949e';
}

/** Arrow direction for change */
export function changeArrow(change: number): string {
  if (change > 5) return '\u25B2';
  if (change > 0) return '\u25B3';
  if (change < -5) return '\u25BC';
  if (change < 0) return '\u25BD';
  return '\u2192';
}

/** Score to bar width percentage */
export function scoreToWidth(score: number, max = 100): string {
  return `${Math.min(100, Math.max(0, (score / max) * 100))}%`;
}
