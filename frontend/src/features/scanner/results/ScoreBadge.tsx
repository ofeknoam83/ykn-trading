import { useState } from 'react';
import { getScoreColor, getScoreLabel } from '../utils/scoreCalculator';
import type { ScoreBreakdown } from '../types/scanner.types';

interface ScoreBadgeProps {
  score: number;
  breakdown?: ScoreBreakdown;
}

export function ScoreBadge({ score, breakdown }: ScoreBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span
        className="sc-score-badge"
        style={{ backgroundColor: getScoreColor(score) }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {score}
      </span>
      {showTooltip && breakdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: 4,
          padding: '10px 12px',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 50,
          whiteSpace: 'nowrap',
          fontSize: 12,
          color: '#e6edf3',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Score: {breakdown.total} ({getScoreLabel(breakdown.total)})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ScoreRow label="Signal Strength" raw={breakdown.signalStrength.raw} weighted={breakdown.signalStrength.weighted} />
            <ScoreRow label="Hit Rate" raw={breakdown.historicalHitRate.raw} weighted={breakdown.historicalHitRate.weighted} />
            <ScoreRow label="Regime" raw={breakdown.regimeCompatibility.raw} weighted={breakdown.regimeCompatibility.weighted} />
            <ScoreRow label="Portfolio Fit" raw={breakdown.portfolioFit.raw} weighted={breakdown.portfolioFit.weighted} />
            <ScoreRow label="Recency" raw={breakdown.recency.raw} weighted={breakdown.recency.weighted} />
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRow({ label, raw, weighted }: { label: string; raw: number; weighted: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ color: '#8b949e' }}>{label}</span>
      <span>{raw.toFixed(0)} &rarr; {weighted.toFixed(1)}</span>
    </div>
  );
}
