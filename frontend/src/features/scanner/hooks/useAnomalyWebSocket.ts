import { useEffect, useRef, useCallback } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import type { AnomalyDetectedMessage, AnomalyExpiredMessage } from '../types/scanner.types';

const WS_BASE = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;

export function useAnomalyWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reconnectAttempt = useRef(0);
  const disposedRef = useRef(false);

  const { addAnomaly, removeAnomaly } = useScannerStore();

  const connect = useCallback(() => {
    if (disposedRef.current) return;

    try {
      const ws = new WebSocket(`${WS_BASE}/anomalies`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttempt.current = 0;
        ws.send(JSON.stringify({ type: 'anomaly.subscribe' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as AnomalyDetectedMessage | AnomalyExpiredMessage;
          if (msg.type === 'anomaly.detected') {
            addAnomaly(msg.anomaly);
          } else if (msg.type === 'anomaly.expired') {
            removeAnomaly(msg.anomalyId);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (disposedRef.current) return;
        const delays = [1000, 2000, 4000, 8000, 16000];
        const delay = delays[Math.min(reconnectAttempt.current, delays.length - 1)];
        reconnectAttempt.current++;
        reconnectTimer.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // WebSocket construction failed
    }
  }, [addAnomaly, removeAnomaly]);

  useEffect(() => {
    disposedRef.current = false;
    connect();
    return () => {
      disposedRef.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);
}
