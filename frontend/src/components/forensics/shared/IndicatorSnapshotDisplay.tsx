import type { IndicatorSnapshot, IndicatorStatus } from '../../../types/forensics';

interface IndicatorSnapshotDisplayProps {
  snapshot: IndicatorSnapshot;
  compact?: boolean;
}

const STATUS_ICONS: Record<IndicatorStatus, string> = {
  bullish: '\u2705',
  bearish: '\u274C',
  neutral: '\u2796',
  warning: '\u26A0\uFE0F',
};

const STATUS_CLASSES: Record<IndicatorStatus, string> = {
  bullish: 'tf-status-bullish',
  bearish: 'tf-status-bearish',
  neutral: 'tf-status-neutral',
  warning: 'tf-status-warning',
};

export function IndicatorSnapshotDisplay({ snapshot, compact }: IndicatorSnapshotDisplayProps) {
  if (compact) {
    return (
      <span className={`tf-indicator-compact ${STATUS_CLASSES[snapshot.status]}`}>
        {STATUS_ICONS[snapshot.status]} {snapshot.name}: {snapshot.value.toFixed(2)}
      </span>
    );
  }

  return (
    <div className={`tf-indicator-snapshot ${STATUS_CLASSES[snapshot.status]}`}>
      <div className="tf-indicator-header">
        <span className="tf-indicator-icon">{STATUS_ICONS[snapshot.status]}</span>
        <span className="tf-indicator-name">{snapshot.name}</span>
        <span className="tf-indicator-value mono">{snapshot.value.toFixed(2)}</span>
      </div>
      <div className="tf-indicator-interp">{snapshot.interpretation}</div>
      {snapshot.detail && (
        <div className="tf-indicator-detail">{snapshot.detail}</div>
      )}
    </div>
  );
}

interface IndicatorSnapshotListProps {
  snapshots: IndicatorSnapshot[];
  title: string;
}

export function IndicatorSnapshotList({ snapshots, title }: IndicatorSnapshotListProps) {
  if (snapshots.length === 0) {
    return (
      <div className="tf-indicator-list">
        <h5>{title}</h5>
        <div className="tf-empty-state">This strategy does not use technical indicators.</div>
      </div>
    );
  }

  return (
    <div className="tf-indicator-list">
      <h5>{title}</h5>
      {snapshots.map((s, i) => (
        <IndicatorSnapshotDisplay key={i} snapshot={s} />
      ))}
    </div>
  );
}
