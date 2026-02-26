import type { ConditionMatch } from '../types/scanner.types';

interface SignalSummaryCellProps {
  conditions: ConditionMatch[];
}

export function SignalSummaryCell({ conditions }: SignalSummaryCellProps) {
  if (conditions.length === 0) return <span className="sc-signal-summary">No signals</span>;

  const summary = conditions
    .map((c) => `${c.indicator} ${c.operator} ${c.threshold} (${c.actual.toFixed(1)})`)
    .join(', ');

  return (
    <span className="sc-signal-summary" title={summary}>
      {conditions.slice(0, 2).map((c, idx) => (
        <span key={c.conditionId}>
          {idx > 0 && ' & '}
          <span style={{ color: '#58a6ff' }}>{c.indicator}</span>
          <span style={{ color: '#8b949e' }}> {c.actual.toFixed(1)}</span>
        </span>
      ))}
      {conditions.length > 2 && (
        <span style={{ color: '#8b949e' }}> +{conditions.length - 2} more</span>
      )}
    </span>
  );
}
