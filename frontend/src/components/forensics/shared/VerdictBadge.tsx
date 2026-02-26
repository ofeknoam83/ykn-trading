interface VerdictBadgeProps {
  verdict: 'better' | 'worse' | 'similar';
  delta?: number;
  label?: string;
}

export function VerdictBadge({ verdict, delta, label }: VerdictBadgeProps) {
  const icon = verdict === 'better' ? '\u2705' : verdict === 'worse' ? '\u274C' : '\u2796';
  const cls =
    verdict === 'better'
      ? 'tf-verdict-better'
      : verdict === 'worse'
        ? 'tf-verdict-worse'
        : 'tf-verdict-similar';

  return (
    <span className={`tf-verdict-badge ${cls}`}>
      {icon}{' '}
      {label ||
        (verdict === 'better'
          ? 'Better'
          : verdict === 'worse'
            ? 'Worse'
            : 'Similar')}
      {delta !== undefined && (
        <span className="tf-verdict-delta">
          {' '}
          {delta >= 0 ? '+' : ''}
          {typeof delta === 'number' ? `$${delta.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : delta}
        </span>
      )}
    </span>
  );
}
