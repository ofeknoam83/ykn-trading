import { useState, useCallback, useEffect } from 'react';
import { ScannerDashboard } from './ScannerDashboard';
import { ScanBuilder } from './builder/ScanBuilder';
import { ScanResultsView } from './results/ScanResultsView';
import { AssetQuickView } from './quick-view/AssetQuickView';
import { AnomalySidebar } from './anomalies/AnomalySidebar';
import { ScanLibrary } from './library/ScanLibrary';
import { TemplateLibrary } from './templates/TemplateLibrary';
import { AlertDropdown } from './alerts/AlertDropdown';
import { useScannerStore } from './stores/scannerStore';
import { useScanAlerts } from './hooks/useScanAlerts';
import { useAnomalyWebSocket } from './hooks/useAnomalyWebSocket';
import { useScanWebSocket } from './hooks/useScanWebSocket';
import { useScanEngine } from './hooks/useScanEngine';
import './scanner.css';

type ScannerView = 'dashboard' | 'scan' | 'library' | 'templates';

export function ScannerPage() {
  const [view, setView] = useState<ScannerView>('dashboard');
  const { activeScan, scanStatus, quickViewOpen, alerts, unreadAlertCount } = useScannerStore();
  const { fetchAlerts, markRead, markAllRead } = useScanAlerts();
  const { loadScanResults } = useScanEngine();
  const [alertDropdownOpen, setAlertDropdownOpen] = useState(false);

  // Subscribe to scan results and anomaly feeds via WebSocket
  useScanWebSocket(activeScan?.id ?? null);
  useAnomalyWebSocket();

  // Fetch historical alerts on mount
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleNewScan = () => setView('scan');
  const handleSelectScan = useCallback((scanId?: string) => {
    if (scanId) {
      loadScanResults(scanId);
    }
    setView('scan');
  }, [loadScanResults]);
  const handleOpenLibrary = () => setView('library');
  const handleOpenTemplates = () => setView('templates');
  const handleBackToDashboard = () => setView('dashboard');

  return (
    <div className="sc-page">
      {/* Scanner Toolbar */}
      <div className="sc-toolbar">
        <div className="sc-toolbar-left">
          <button
            className={`sc-toolbar-btn ${view === 'dashboard' ? 'sc-toolbar-btn--active' : ''}`}
            onClick={handleBackToDashboard}
          >
            Dashboard
          </button>
          <button
            className={`sc-toolbar-btn ${view === 'scan' ? 'sc-toolbar-btn--active' : ''}`}
            onClick={() => handleSelectScan()}
          >
            {activeScan ? activeScan.name : 'Active Scan'}
          </button>
          <button className="sc-toolbar-btn sc-toolbar-btn--primary" onClick={handleNewScan}>
            + New Scan
          </button>
          <button
            className={`sc-toolbar-btn ${view === 'templates' ? 'sc-toolbar-btn--active' : ''}`}
            onClick={handleOpenTemplates}
          >
            Templates
          </button>
          <button
            className={`sc-toolbar-btn ${view === 'library' ? 'sc-toolbar-btn--active' : ''}`}
            onClick={handleOpenLibrary}
          >
            My Scans
          </button>
        </div>
        <div className="sc-toolbar-right">
          <div className="sc-alert-bell-wrapper">
            <button
              className="sc-toolbar-btn sc-alert-bell"
              onClick={() => setAlertDropdownOpen(!alertDropdownOpen)}
            >
              Alerts{unreadAlertCount > 0 && (
                <span className="sc-alert-badge">{unreadAlertCount}</span>
              )}
            </button>
            {alertDropdownOpen && (
              <AlertDropdown
                alerts={alerts}
                onMarkRead={markRead}
                onMarkAllRead={markAllRead}
                onClose={() => setAlertDropdownOpen(false)}
              />
            )}
          </div>
          {scanStatus === 'running' && (
            <span className="sc-status-live">
              <span className="sc-status-dot" /> Live
            </span>
          )}
          {scanStatus === 'paused' && (
            <span className="sc-status-paused">Paused</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="sc-content">
        {view === 'dashboard' && (
          <ScannerDashboard
            onNewScan={handleNewScan}
            onSelectScan={handleSelectScan}
            onOpenTemplates={handleOpenTemplates}
          />
        )}

        {view === 'scan' && (
          <div className="sc-scan-layout">
            <ScanBuilder />
            <div className="sc-scan-results-area">
              <ScanResultsView />
              <AnomalySidebar />
            </div>
            {quickViewOpen && <AssetQuickView />}
          </div>
        )}

        {view === 'library' && (
          <ScanLibrary
            onBack={handleBackToDashboard}
            onSelectScan={handleSelectScan}
          />
        )}

        {view === 'templates' && (
          <TemplateLibrary
            onBack={handleBackToDashboard}
            onUseTemplate={handleSelectScan}
          />
        )}
      </div>
    </div>
  );
}
