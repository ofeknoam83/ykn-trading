import { useScannerStore } from '../stores/scannerStore';

interface AlertBellProps {
  onClick: () => void;
}

export function AlertBell({ onClick }: AlertBellProps) {
  const { unreadAlertCount } = useScannerStore();

  return (
    <button className="sc-toolbar-btn sc-alert-bell" onClick={onClick}>
      Alerts
      {unreadAlertCount > 0 && (
        <span className="sc-alert-badge">{unreadAlertCount}</span>
      )}
    </button>
  );
}
