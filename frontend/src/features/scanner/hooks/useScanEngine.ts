import { useCallback } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import * as scannerApi from '../../../api/scannerApi';
import type { ScanDefinition } from '../types/scanner.types';

export function useScanEngine() {
  const {
    setActiveScan,
    setScanStatus,
    updateResults,
  } = useScannerStore();

  const startScan = useCallback(async (scan: ScanDefinition, mode: 'snapshot' | 'monitor') => {
    setActiveScan(scan);
    setScanStatus('running');

    try {
      if (mode === 'snapshot') {
        const results = await scannerApi.runSnapshotScan(scan.id);
        updateResults('snapshot', results);
        setScanStatus('idle');
      } else {
        // Monitor mode uses WebSocket — just update the scan status
        // The useScanWebSocket hook handles the subscription
        await scannerApi.updateScanStatus(scan.id, 'active');
      }
    } catch {
      setScanStatus('error');
    }
  }, [setActiveScan, setScanStatus, updateResults]);

  const pauseScan = useCallback(async (scanId: string) => {
    try {
      await scannerApi.updateScanStatus(scanId, 'paused');
      setScanStatus('paused');
    } catch {
      // keep running if pause fails
    }
  }, [setScanStatus]);

  const createAndRunScan = useCallback(async (
    scanData: Omit<ScanDefinition, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ) => {
    try {
      const scan = await scannerApi.createScan(scanData);
      await startScan(scan, scan.mode);
      return scan;
    } catch {
      setScanStatus('error');
      return null;
    }
  }, [startScan, setScanStatus]);

  const loadScanResults = useCallback(async (scanId: string) => {
    try {
      const results = await scannerApi.getScanResults(scanId);
      updateResults('snapshot', results);
    } catch {
      // silently fail
    }
  }, [updateResults]);

  return { startScan, pauseScan, createAndRunScan, loadScanResults };
}
