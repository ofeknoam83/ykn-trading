import { useEffect, useRef, useCallback } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import type { ScannerWebSocketMessage } from '../types/scanner.types';

const WS_BASE = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

export function useScanWebSocket(scanId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const disposedRef = useRef(false);

  const { updateResults, addAlert, addAnomaly, removeAnomaly, setMarketOverview } =
    useScannerStore();

  const connect = useCallback(() => {
    if (!scanId || disposedRef.current) return;

    try {
      const ws = new WebSocket(`${WS_BASE}/scanner`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttempt.current = 0;
        ws.send(JSON.stringify({ type: 'scan.subscribe', scanId, mode: 'monitor' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg: ScannerWebSocketMessage = JSON.parse(event.data);
          switch (msg.type) {
            case 'scan.results':
              if (msg.scanId === scanId) {
                updateResults(msg.action, msg.results);
              }
              break;
            case 'scan.alert':
              if (msg.scanId === scanId) {
                addAlert({
                  id: `alert_${Date.now()}`,
                  scanId: msg.scanId,
                  userId: '',
                  alertType: msg.score >= 80 ? 'high_score_match' : 'new_match',
                  symbol: msg.symbol,
                  score: msg.score,
                  message: `${msg.symbol} matched scan (Score: ${msg.score})`,
                  channels: ['in_app'],
                  sentAt: msg.timestamp,
                  actedOn: false,
                });
              }
              break;
            case 'anomaly.detected':
              addAnomaly(msg.anomaly);
              break;
            case 'anomaly.expired':
              removeAnomaly(msg.anomalyId);
              break;
            case 'market.overview':
              setMarketOverview(msg.data);
              break;
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (disposedRef.current) return;
        const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt.current, RECONNECT_DELAYS.length - 1)];
        reconnectAttempt.current++;
        reconnectTimer.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // WebSocket construction failed
    }
  }, [scanId, updateResults, addAlert, addAnomaly, removeAnomaly, setMarketOverview]);

  useEffect(() => {
    disposedRef.current = false;
    connect();
    return () => {
      disposedRef.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        if (scanId && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'scan.unsubscribe', scanId }));
        }
        wsRef.current.close();
      }
    };
  }, [connect, scanId]);

  const sendMessage = useCallback((msg: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { sendMessage };
}
