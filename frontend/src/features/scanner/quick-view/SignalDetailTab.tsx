import type { ScanResult } from '../types/scanner.types';

interface SignalDetailTabProps {
  result: ScanResult;
}

export function SignalDetailTab({ result }: SignalDetailTabProps) {
  return (
    <div className="sc-signal-detail">
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>
        Matched Conditions
      </div>
      {result.matchedConditions.map((cond) => (
        <div key={cond.conditionId} className="sc-signal-detail-row">
          <span className="sc-signal-check">&check;</span>
          <span className="sc-signal-indicator">
            {cond.indicator} {cond.operator} {cond.threshold}
          </span>
          <span className="sc-signal-value">
            Actual: {cond.actual.toFixed(2)} (Strength: {cond.strength}/100)
          </span>
        </div>
      ))}

      {result.convergenceStatus && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>
            Convergence: {result.convergenceStatus.matchingTimeframes}/{result.convergenceStatus.totalTimeframes}
          </div>
          <div className="sc-convergence-dots">
            {result.convergenceStatus.details.map((d, i) => (
              <span
                key={i}
                className={`sc-convergence-dot ${d.matched ? 'sc-convergence-dot--matched' : 'sc-convergence-dot--unmatched'}`}
                title={`${d.timeframe}: ${d.summary}`}
              />
            ))}
          </div>
          {result.convergenceStatus.details.map((d, i) => (
            <div key={i} className="sc-signal-detail-row" style={{ marginTop: 4 }}>
              <span className={d.matched ? 'sc-signal-check' : ''} style={{ color: d.matched ? '#3fb950' : '#8b949e' }}>
                {d.matched ? '\u25CF' : '\u25CB'}
              </span>
              <span style={{ color: '#8b949e' }}>{d.timeframe}</span>
              <span className="sc-signal-value">{d.summary}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: '#8b949e' }}>
        Signal Strength: {result.scoreBreakdown.signalStrength.raw}/100
      </div>
      <div style={{ fontSize: 12, color: '#8b949e' }}>
        First matched: {new Date(result.firstMatchedAt).toLocaleString()}
      </div>
    </div>
  );
}
