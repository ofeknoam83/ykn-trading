interface Props {
  count: number;
  onClick: () => void;
}

export function AlertBadge({ count, onClick }: Props) {
  return (
    <button
      className={`poc-alert-badge-btn ${count > 0 ? 'has-alerts' : ''}`}
      onClick={onClick}
    >
      <span className="poc-alert-count">{count}</span>
      <span className="poc-alert-label">Alerts</span>
    </button>
  );
}
