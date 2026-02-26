import { useScannerStore } from '../stores/scannerStore';
import type { AnomalySeverity } from '../types/scanner.types';

function severityDot(severity: AnomalySeverity) {
  return <span className={`sc-severity-dot sc-severity-dot--${severity}`} />;
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

export function TopAnomaliesCard() {
  const { anomalies } = useScannerStore();
  const activeAnomalies = anomalies.filter((a) => !a.dismissed).slice(0, 5);

  return (
    <div className="sc-card">
      <div className="sc-card-header">
        <span className="sc-card-title">Top Anomalies</span>
      </div>
      {activeAnomalies.length === 0 ? (
        <div style={{ fontSize: 13, color: '#8b949e' }}>
          No anomalies detected currently.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeAnomalies.map((anomaly) => (
            <div key={anomaly.id} style={{ fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {severityDot(anomaly.severity)}
                <span style={{ color: '#e6edf3', fontWeight: 500 }}>
                  {anomaly.type.replace(/_/g, ' ')}
                </span>
                <span style={{ color: '#8b949e', marginLeft: 'auto' }}>
                  {timeAgo(anomaly.detectedAt)}
                </span>
              </div>
              <div style={{ color: '#8b949e', marginTop: 2, marginLeft: 14 }}>
                {anomaly.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
