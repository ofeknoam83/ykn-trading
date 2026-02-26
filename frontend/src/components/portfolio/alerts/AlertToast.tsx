import { useEffect, useState } from 'react';
import type { AlertTrigger } from '../../../types/portfolio';

interface Props {
  alert: AlertTrigger;
  onDismiss: () => void;
}

export function AlertToast({ alert, onDismiss }: Props) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 10 seconds unless there are auto-actions
    const hasAutoAction = alert.actions_taken.some((a) => a.type !== 'notify');
    if (!hasAutoAction) {
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(onDismiss, 300);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [alert, onDismiss]);

  return (
    <div className={`poc-alert-toast poc-alert-toast-${alert.severity} ${exiting ? 'exiting' : ''}`}>
      <span className="poc-toast-icon">
        {alert.severity === 'critical' ? '\u{1F534}' : '\u{1F7E1}'}
      </span>
      <div className="poc-toast-content">
        <div className="poc-toast-title">Alert: {alert.rule_name}</div>
        <div className="poc-toast-message">{alert.message}</div>
        {alert.actions_taken.length > 0 && (
          <div className="poc-toast-actions-taken">
            Action taken: {alert.actions_taken.map((a) => a.type.replace('_', ' ')).join(', ')}
          </div>
        )}
      </div>
      <button className="poc-toast-close" onClick={onDismiss}>&times;</button>
    </div>
  );
}
