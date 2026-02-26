import { useEffect } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { getSentimentAlerts } from '../../../api/sentimentApi';

export function useSentimentAlerts() {
  const alerts = useSentimentStore((s) => s.sentimentAlerts);
  const unreadCount = useSentimentStore((s) => s.unreadSentimentAlertCount);

  useEffect(() => {
    getSentimentAlerts()
      .then((data) => {
        data.alerts.forEach((a) => useSentimentStore.getState().addSentimentAlert(a));
      })
      .catch(() => {});
  }, []);

  return { alerts, unreadCount };
}
