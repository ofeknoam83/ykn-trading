import { useScannerStore } from '../stores/scannerStore';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RecentAlertsCard() {
  const { alerts } = useScannerStore();
  const recent = alerts.slice(0, 5);

  return (
    <div className="sc-card">
      <div className="sc-card-header">
        <span className="sc-card-title">Recent Alerts</span>
      </div>
      {recent.length === 0 ? (
        <div style={{ fontSize: 13, color: '#8b949e' }}>
          No alerts yet. Alerts will appear when scan conditions are met.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recent.map((alert) => (
            <div key={alert.id} style={{ fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#8b949e' }}>{timeAgo(alert.sentAt)}</span>
                <span style={{ color: '#e6edf3' }}>{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
