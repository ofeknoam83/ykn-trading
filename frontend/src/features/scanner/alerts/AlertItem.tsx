import type { ScanAlert } from '../types/scanner.types';

interface AlertItemProps {
  alert: ScanAlert;
  onMarkRead: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AlertItem({ alert, onMarkRead }: AlertItemProps) {
  const isUnread = !alert.readAt;

  return (
    <div
      className={`sc-alert-item ${isUnread ? 'sc-alert-item--unread' : ''}`}
      onClick={onMarkRead}
    >
      {isUnread && <div className="sc-alert-item-dot" />}
      <div className="sc-alert-item-content">
        <div className="sc-alert-item-message">{alert.message}</div>
        <div className="sc-alert-item-time">
          {timeAgo(alert.sentAt)}
          {alert.symbol && <span> &bull; {alert.symbol}</span>}
          {alert.score !== undefined && alert.score !== null && (
            <span> &bull; Score: {alert.score}</span>
          )}
        </div>
      </div>
    </div>
  );
}
