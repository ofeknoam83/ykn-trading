import { useEffect } from 'react';
import { useScannerStore } from './stores/scannerStore';
import { MarketOverviewStrip } from './dashboard/MarketOverviewStrip';
import { ActiveScanCards } from './dashboard/ActiveScanCards';
import { TopAnomaliesCard } from './dashboard/TopAnomaliesCard';
import { RecentAlertsCard } from './dashboard/RecentAlertsCard';
import { OpportunityHeatmap } from './dashboard/OpportunityHeatmap';
import * as scannerApi from '../../api/scannerApi';

interface ScannerDashboardProps {
  onNewScan: () => void;
  onSelectScan: (scanId: string) => void;
  onOpenTemplates: () => void;
}

export function ScannerDashboard({ onNewScan, onSelectScan, onOpenTemplates }: ScannerDashboardProps) {
  const { setMarketOverview, setActiveScanSummaries, setSavedScans } = useScannerStore();

  // Fetch dashboard data on mount
  useEffect(() => {
    scannerApi.getMarketOverview()
      .then(setMarketOverview)
      .catch(() => {});

    scannerApi.listScans()
      .then((scans) => {
        setSavedScans(scans);
        const summaries = scans
          .filter((s) => s.status === 'active')
          .map((s) => ({
            scanId: s.id,
            name: s.name,
            matchCount: 0,
            topMatch: null,
            lastMatchTime: null,
            status: 'running' as const,
            alertsEnabled: s.alerts.enabled,
          }));
        setActiveScanSummaries(summaries);
      })
      .catch(() => {});

    scannerApi.getAnomalies().catch(() => {});
  }, [setMarketOverview, setActiveScanSummaries, setSavedScans]);

  return (
    <div className="sc-dashboard">
      <MarketOverviewStrip />

      <div className="sc-dashboard-grid">
        <ActiveScanCards onSelectScan={onSelectScan} onNewScan={onNewScan} />
        <TopAnomaliesCard />
        <RecentAlertsCard />
      </div>

      <OpportunityHeatmap />

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: 8 }}>
        <button className="sc-toolbar-btn sc-toolbar-btn--primary" onClick={onNewScan}>
          + New Scan
        </button>
        <button className="sc-toolbar-btn" onClick={onOpenTemplates}>
          Browse Templates
        </button>
      </div>
    </div>
  );
}
