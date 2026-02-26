import type { ScanResult } from '../types/scanner.types';

export function exportResultsToCSV(results: ScanResult[]): string {
  const headers = [
    'Symbol', 'Name', 'Score', 'Price', 'Change %', 'Sector',
    'Market Cap', 'Volume Ratio', 'Matched At', 'Signal Summary',
  ];

  const rows = results.map((r) => [
    r.symbol,
    `"${r.name}"`,
    r.score.toString(),
    r.price.toFixed(2),
    r.priceChangePct.toFixed(2),
    r.sector,
    formatMarketCap(r.marketCap),
    `${r.volumeRatio.toFixed(1)}x`,
    r.firstMatchedAt,
    `"${r.matchedConditions.map((c) => `${c.indicator} ${c.operator} ${c.threshold} (actual: ${c.actual})`).join('; ')}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

export { formatMarketCap };
