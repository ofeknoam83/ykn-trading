import { useState, useCallback, useEffect } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import * as scannerApi from '../../../api/scannerApi';

export function useScanAlerts() {
  const { alerts, unreadAlertCount, addAlert, markAlertRead, markAllAlertsRead } =
    useScannerStore();
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const { alerts: fetchedAlerts } = await scannerApi.getAlerts();
      // Populate store from server
      for (const alert of fetchedAlerts) {
        addAlert(alert);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [addAlert]);

  const handleMarkRead = useCallback(async (id: string) => {
    markAlertRead(id);
    try {
      await scannerApi.markAlertRead(id);
    } catch {
      // optimistic update already applied
    }
  }, [markAlertRead]);

  const handleMarkAllRead = useCallback(async () => {
    markAllAlertsRead();
    try {
      await scannerApi.markAllAlertsRead();
    } catch {
      // optimistic update already applied
    }
  }, [markAllAlertsRead]);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    alerts,
    unreadAlertCount,
    loading,
    fetchAlerts,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
  };
}
