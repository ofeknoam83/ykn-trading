import type { PortfolioImpact } from '../types/scanner.types';

interface PortfolioImpactPreviewProps {
  symbol: string;
  positionSize: number;
  impact: PortfolioImpact;
}

export function PortfolioImpactPreview({ symbol, positionSize, impact }: PortfolioImpactPreviewProps) {
  return (
    <div className="sc-portfolio-impact">
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>
        Portfolio Impact: Add {symbol} (${positionSize.toLocaleString()})
      </div>

      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#8b949e' }}>
            <th style={{ textAlign: 'left', padding: '4px 0' }}>Metric</th>
            <th style={{ textAlign: 'right', padding: '4px 0' }}>Current</th>
            <th style={{ textAlign: 'right', padding: '4px 0' }}>After</th>
            <th style={{ textAlign: 'right', padding: '4px 0' }}>Change</th>
          </tr>
        </thead>
        <tbody>
          <ImpactMetricRow
            label="Sector Alloc."
            current={`${(impact.current.techAllocation * 100).toFixed(1)}%`}
            after={`${(impact.after.techAllocation * 100).toFixed(1)}%`}
            change={(impact.after.techAllocation - impact.current.techAllocation) * 100}
            format="pct"
          />
          <ImpactMetricRow
            label="Portfolio Beta"
            current={impact.current.beta.toFixed(2)}
            after={impact.after.beta.toFixed(2)}
            change={impact.after.beta - impact.current.beta}
            format="num"
          />
          <ImpactMetricRow
            label="Concentration"
            current={impact.current.hhi.toFixed(2)}
            after={impact.after.hhi.toFixed(2)}
            change={impact.after.hhi - impact.current.hhi}
            format="num"
          />
          <ImpactMetricRow
            label="SPY Corr."
            current={impact.current.spyCorrelation.toFixed(2)}
            after={impact.after.spyCorrelation.toFixed(2)}
            change={impact.after.spyCorrelation - impact.current.spyCorrelation}
            format="num"
          />
          <ImpactMetricRow
            label="Max Drawdown"
            current={`${impact.current.maxDrawdown.toFixed(1)}%`}
            after={`${impact.after.maxDrawdown.toFixed(1)}%`}
            change={impact.after.maxDrawdown - impact.current.maxDrawdown}
            format="pct"
          />
        </tbody>
      </table>

      {impact.warnings.map((w, i) => (
        <div key={i} className="sc-impact-warning">{w}</div>
      ))}

      {impact.alternatives.length > 0 && (
        <div className="sc-impact-alternative">
          Alternative: {impact.alternatives[0].symbol} ({impact.alternatives[0].sector}) — Score {impact.alternatives[0].score}. {impact.alternatives[0].reason}
        </div>
      )}
    </div>
  );
}

function ImpactMetricRow({ label, current, after, change, format }: { label: string; current: string; after: string; change: number; format: 'pct' | 'num' }) {
  const color = Math.abs(change) < 0.001 ? '#8b949e' : change > 0 ? '#f85149' : '#3fb950';
  const sign = change > 0 ? '+' : '';
  const formatted = format === 'pct' ? `${sign}${change.toFixed(1)}%` : `${sign}${change.toFixed(2)}`;

  return (
    <tr>
      <td style={{ padding: '3px 0', color: '#8b949e' }}>{label}</td>
      <td style={{ textAlign: 'right', padding: '3px 0', color: '#e6edf3' }}>{current}</td>
      <td style={{ textAlign: 'right', padding: '3px 0', color: '#e6edf3' }}>{after}</td>
      <td style={{ textAlign: 'right', padding: '3px 0', color }}>{formatted}</td>
    </tr>
  );
}
