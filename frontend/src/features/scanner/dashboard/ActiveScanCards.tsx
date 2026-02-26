import { useScannerStore } from '../stores/scannerStore';
import type { ScanSummaryCard } from '../types/scanner.types';

interface ActiveScanCardsProps {
  onSelectScan: (scanId: string) => void;
  onNewScan: () => void;
}

export function ActiveScanCards({ onSelectScan, onNewScan }: ActiveScanCardsProps) {
  const { activeScanSummaries } = useScannerStore();

  return (
    <div className="sc-card">
      <div className="sc-card-header">
        <span className="sc-card-title">Active Scans ({activeScanSummaries.length})</span>
      </div>
      {activeScanSummaries.length === 0 ? (
        <div style={{ fontSize: 13, color: '#8b949e' }}>
          No active scans. Create one to start monitoring.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeScanSummaries.map((card: ScanSummaryCard) => (
            <div
              key={card.scanId}
              className="sc-scan-summary sc-card"
              onClick={() => onSelectScan(card.scanId)}
            >
              <div className="sc-scan-summary-name">{card.name}</div>
              <div className="sc-scan-summary-meta">
                {card.matchCount} matches
                {card.status === 'running' && <span style={{ color: '#3fb950' }}> &bull; Running</span>}
                {card.status === 'paused' && <span style={{ color: '#d29922' }}> &bull; Paused</span>}
              </div>
              {card.topMatch && (
                <div className="sc-scan-summary-top">
                  Top: {card.topMatch.symbol} ({card.topMatch.score})
                </div>
              )}
              {card.lastMatchTime && (
                <div className="sc-scan-summary-meta">
                  Last match: {new Date(card.lastMatchTime).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <button className="sc-add-condition" onClick={onNewScan} style={{ marginTop: 8 }}>
        + New Scan
      </button>
    </div>
  );
}
