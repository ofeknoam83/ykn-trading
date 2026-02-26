import { useSentimentStore } from '../stores/sentimentStore';
import { markSentimentAlertRead } from '../../../api/sentimentApi';
import type { SentimentAlert } from '../types/sentiment.types';

interface Props {
  alert: SentimentAlert;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#f85149',
  medium: '#d29922',
  low: '#8b949e',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function SentimentAlertItem({ alert }: Props) {
  const markRead = useSentimentStore((s) => s.markSentimentAlertRead);

  const handleClick = () => {
    if (!alert.readAt) {
      markRead(alert.id);
      markSentimentAlertRead(alert.id).catch(() => {});
    }
    // Navigate to profile
    useSentimentStore.getState().setActiveProfileSymbol(alert.symbol);
    useSentimentStore.getState().setActiveView('profile');
  };

  return (
    <div
      className={`sent-alert-item ${!alert.readAt ? 'sent-alert-unread' : ''}`}
      onClick={handleClick}
    >
      <div
        className="sent-alert-dot"
        style={{ background: PRIORITY_COLORS[alert.priority] || '#8b949e' }}
      />
      <div className="sent-alert-body">
        <div className="sent-alert-msg">
          <span style={{ color: '#58a6ff', fontWeight: 700 }}>{alert.symbol}</span>{' '}
          {alert.message}
        </div>
        <div className="sent-alert-time">
          {timeAgo(alert.triggeredAt)} &middot; {alert.alertType.replace(/_/g, ' ')} &middot; {alert.priority}
        </div>
      </div>
    </div>
  );
}
