import { useScannerStore } from '../stores/scannerStore';
import * as scannerApi from '../../../api/scannerApi';
import type { Anomaly } from '../types/scanner.types';

interface AnomalyCardProps {
  anomaly: Anomaly;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AnomalyCard({ anomaly }: AnomalyCardProps) {
  const { dismissAnomaly, openQuickView } = useScannerStore();

  const handleDismiss = async () => {
    dismissAnomaly(anomaly.id);
    try { await scannerApi.dismissAnomaly(anomaly.id); } catch { /* optimistic */ }
  };

  const handleInvestigate = () => {
    if (anomaly.symbols.length > 0) {
      openQuickView(anomaly.symbols[0]);
    }
  };

  return (
    <div className="sc-anomaly-card">
      <div className="sc-anomaly-card-header">
        <span className="sc-anomaly-type">
          <span className={`sc-severity-dot sc-severity-dot--${anomaly.severity}`} />
          {anomaly.type.replace(/_/g, ' ')}
        </span>
        <span className="sc-anomaly-time">{timeAgo(anomaly.detectedAt)}</span>
      </div>
      <div className="sc-anomaly-description">{anomaly.description}</div>
      {anomaly.dataPoints.length > 0 && (
        <div style={{ marginTop: 4, fontSize: 11, color: '#8b949e' }}>
          {anomaly.dataPoints[0].metric}: expected {anomaly.dataPoints[0].expected.toFixed(2)}, actual {anomaly.dataPoints[0].actual.toFixed(2)} ({anomaly.dataPoints[0].deviation.toFixed(1)}&sigma;)
        </div>
      )}
      {anomaly.suggestedAction && (
        <div className="sc-anomaly-suggestion">{anomaly.suggestedAction}</div>
      )}
      <div className="sc-anomaly-actions">
        <button className="sc-action-btn" onClick={handleInvestigate}>
          Investigate
        </button>
        <button className="sc-action-btn" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
