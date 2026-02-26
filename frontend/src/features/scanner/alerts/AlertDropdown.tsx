import { AlertItem } from './AlertItem';
import type { ScanAlert } from '../types/scanner.types';

interface AlertDropdownProps {
  alerts: ScanAlert[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export function AlertDropdown({ alerts, onMarkRead, onMarkAllRead, onClose }: AlertDropdownProps) {
  return (
    <div className="sc-alert-dropdown">
      <div className="sc-alert-dropdown-header">
        <span className="sc-alert-dropdown-title">Alerts</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onMarkAllRead}
            style={{ fontSize: 11, color: '#58a6ff', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Mark All Read
          </button>
          <button
            onClick={onClose}
            style={{ fontSize: 14, color: '#8b949e', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      </div>
      <div className="sc-alert-dropdown-body">
        {alerts.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#8b949e' }}>
            No alerts yet.
          </div>
        ) : (
          alerts.slice(0, 50).map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onMarkRead={() => onMarkRead(alert.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
