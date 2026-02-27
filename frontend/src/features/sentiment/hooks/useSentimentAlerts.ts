import { useEffect } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { getSentimentAlerts } from '../../../api/sentimentApi';

export function useSentimentAlerts() {
  const alerts = useSentimentStore((s) => s.sentimentAlerts);
  const unreadCount = useSentimentStore((s) => s.unreadSentimentAlertCount);

  useEffect(() => {
    getSentimentAlerts()
      .then((data) => {
        useSentimentStore.getState().setSentimentAlerts(data.alerts);
      })
      .catch(() => {});
  }, []);

  return { alerts, unreadCount };
}
