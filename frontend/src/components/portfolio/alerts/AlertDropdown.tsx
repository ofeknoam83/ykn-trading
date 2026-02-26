import type { AlertTrigger } from '../../../types/portfolio';
import { dismissAlert as apiDismissAlert } from '../../../api/portfolioApi';

interface Props {
  alerts: AlertTrigger[];
  onDismiss: (alertId: string) => void;
  onRefresh: () => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AlertDropdown({ alerts, onDismiss, onRefresh }: Props) {
  if (alerts.length === 0) return null;

  async function handleDismiss(alertId: string) {
    try {
      await apiDismissAlert(alertId);
    } catch {
      // silent
    }
    onDismiss(alertId);
  }

  return (
    <div className="poc-alert-dropdown" id="poc-alert-dropdown">
      <div className="poc-alert-dropdown-header">
        <h4>Active Alerts ({alerts.length})</h4>
      </div>
      <div className="poc-alert-dropdown-list">
        {alerts.map((alert) => (
          <div
            key={alert.alert_id}
            className={`poc-alert-item poc-alert-${alert.severity}`}
          >
            <span className="poc-alert-severity-icon">
              {alert.severity === 'critical' ? '\u{1F534}' : '\u{1F7E1}'}
            </span>
            <div className="poc-alert-content">
              <div className="poc-alert-name">{alert.rule_name}</div>
              <div className="poc-alert-message">{alert.message}</div>
              <div className="poc-alert-time">{timeAgo(alert.triggered_at)}</div>
              {alert.actions_taken.length > 0 && (
                <div className="poc-alert-actions-taken">
                  Actions: {alert.actions_taken.map((a) => a.type).join(', ')}
                </div>
              )}
            </div>
            <div className="poc-alert-item-actions">
              <button className="poc-btn-xs poc-btn-ghost" onClick={() => handleDismiss(alert.alert_id)}>
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="poc-alert-dropdown-footer">
        <button className="poc-btn-ghost" onClick={onRefresh}>
          Manage All Alerts
        </button>
      </div>
    </div>
  );
}
