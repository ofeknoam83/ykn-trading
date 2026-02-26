import { useEffect, useRef } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import type { SentimentWebSocketMessage } from '../types/sentiment.types';

const WS_BASE = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;

export function useSentimentWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectDelay = useRef(1000);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(`${WS_BASE}/sentiment`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectDelay.current = 1000;
      };

      ws.onmessage = (event) => {
        try {
          const msg: SentimentWebSocketMessage = JSON.parse(event.data);
          const store = useSentimentStore.getState();

          switch (msg.type) {
            case 'sentiment.update':
              // Update watchlist entry if exists
              store.setSentimentWatchlist(
                store.sentimentWatchlist.map((w) =>
                  w.symbol === msg.symbol
                    ? { ...w, composite: msg.composite, ...msg.components, change24h: msg.composite - w.composite }
                    : w,
                ),
              );
              // Update active profile if matches
              if (store.activeProfileSymbol === msg.symbol && store.activeProfile) {
                store.setActiveProfile({
                  ...store.activeProfile,
                  composite: msg.composite,
                  components: msg.components,
                });
              }
              break;

            case 'sentiment.news':
              store.addNewsArticle(msg.article);
              break;

            case 'sentiment.social_spike':
              // Could trigger UI notification
              break;

            case 'sentiment.insider':
              // Refresh insider data
              break;

            case 'sentiment.options_flow':
              store.addOptionsFlowEntry(msg.entry);
              break;

            case 'sentiment.event':
              store.addEvent(msg.event);
              break;

            case 'sentiment.alert':
              store.addSentimentAlert(msg.alert);
              break;
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        reconnectTimer.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 16000);
          connect();
        }, reconnectDelay.current);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);
}
