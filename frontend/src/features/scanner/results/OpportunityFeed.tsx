import { useScannerStore } from '../stores/scannerStore';
import { getScoreColor } from '../utils/scoreCalculator';
import { SparklineCell } from './SparklineCell';
import type { ScanResult } from '../types/scanner.types';

interface OpportunityFeedProps {
  results: ScanResult[];
}

export function OpportunityFeed({ results }: OpportunityFeedProps) {
  const { openQuickView } = useScannerStore();

  if (results.length === 0) return null;

  return (
    <div className="sc-opportunity-feed">
      {results.map((r) => (
        <div
          key={r.id}
          className="sc-feed-item"
          onClick={() => openQuickView(r.symbol)}
        >
          <span className="sc-feed-symbol">{r.symbol}</span>
          <span className="sc-feed-score" style={{ color: getScoreColor(r.score) }}>
            {r.score}
          </span>
          <span style={{ color: r.priceChangePct >= 0 ? '#3fb950' : '#f85149', fontSize: 11 }}>
            {r.priceChangePct >= 0 ? '+' : ''}{r.priceChangePct.toFixed(1)}%
          </span>
          <SparklineCell data={r.sparklineData} width={60} height={20} />
        </div>
      ))}
    </div>
  );
}
