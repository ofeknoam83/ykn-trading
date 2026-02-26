import { useEffect } from 'react';
import { usePortfolioContext } from '../hooks/usePortfolioContext';

interface PortfolioContextSectionProps {
  symbol: string;
  sector: string;
}

export function PortfolioContextSection({ symbol, sector }: PortfolioContextSectionProps) {
  const { impact, loading, fetchImpact } = usePortfolioContext();

  useEffect(() => {
    fetchImpact(symbol, 10000);
  }, [symbol, fetchImpact]);

  if (loading) {
    return (
      <div style={{ marginTop: 16, fontSize: 12, color: '#8b949e' }}>
        Loading portfolio context...
      </div>
    );
  }

  if (!impact) {
    return (
      <div style={{ marginTop: 16, fontSize: 12, color: '#8b949e', fontStyle: 'italic' }}>
        Connect your portfolio in the Portfolio Operations Center to enable portfolio-aware analysis.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>
        Portfolio Context
      </div>
      <div className="sc-portfolio-impact">
        <div className="sc-impact-row" style={{ fontWeight: 600, fontSize: 11, color: '#8b949e' }}>
          <span className="sc-impact-metric">Metric</span>
          <div className="sc-impact-values">
            <span className="sc-impact-current">Current</span>
            <span className="sc-impact-after">After</span>
          </div>
        </div>
        <ImpactRow label={`${sector} Allocation`} current={`${(impact.current.techAllocation * 100).toFixed(1)}%`} after={`${(impact.after.techAllocation * 100).toFixed(1)}%`} diff={impact.after.techAllocation - impact.current.techAllocation} />
        <ImpactRow label="Portfolio Beta" current={impact.current.beta.toFixed(2)} after={impact.after.beta.toFixed(2)} diff={impact.after.beta - impact.current.beta} />
        <ImpactRow label="Concentration (HHI)" current={impact.current.hhi.toFixed(2)} after={impact.after.hhi.toFixed(2)} diff={impact.after.hhi - impact.current.hhi} />

        {impact.warnings.map((w, i) => (
          <div key={i} className="sc-impact-warning">
            {w}
          </div>
        ))}

        {impact.alternatives.length > 0 && (
          <div className="sc-impact-alternative">
            Alternative: {impact.alternatives[0].symbol} ({impact.alternatives[0].sector}) — Score {impact.alternatives[0].score}. {impact.alternatives[0].reason}
          </div>
        )}
      </div>
    </div>
  );
}

function ImpactRow({ label, current, after, diff }: { label: string; current: string; after: string; diff: number }) {
  const cls = diff > 0 ? 'sc-impact-change--negative' : diff < 0 ? 'sc-impact-change--positive' : '';
  return (
    <div className="sc-impact-row">
      <span className="sc-impact-metric">{label}</span>
      <div className="sc-impact-values">
        <span className="sc-impact-current">{current}</span>
        <span className={`sc-impact-after ${cls}`}>{after}</span>
      </div>
    </div>
  );
}
