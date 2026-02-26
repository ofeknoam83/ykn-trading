import type { ConcentrationData } from '../../../types/portfolio';

interface Props {
  concentration: ConcentrationData | null;
}

export function ConcentrationWarnings({ concentration }: Props) {
  if (!concentration || concentration.warnings.length === 0) return null;

  return (
    <div className="poc-risk-widget poc-concentration-warnings">
      {concentration.warnings.map((w, i) => (
        <div key={i} className="poc-warning-item">
          <span className="poc-warning-icon">&#x26A0;&#xFE0F;</span>
          <span className="poc-warning-text">{w.message}</span>
          <span className="poc-warning-values">
            {w.current_pct.toFixed(1)}% (threshold: {w.threshold_pct.toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );
}
