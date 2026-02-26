import { useState } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import { AnomalyCard } from './AnomalyCard';
import { AnomalyConfigModal } from './AnomalyConfigModal';

export function AnomalySidebar() {
  const { anomalies } = useScannerStore();
  const [showConfig, setShowConfig] = useState(false);
  const activeAnomalies = anomalies.filter((a) => !a.dismissed);

  return (
    <div className="sc-anomaly-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="sc-anomaly-title">
          AI-Detected Anomalies ({activeAnomalies.length})
        </span>
        <button
          onClick={() => setShowConfig(true)}
          style={{ fontSize: 11, color: '#8b949e', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          Settings
        </button>
      </div>

      {activeAnomalies.length === 0 ? (
        <div style={{ fontSize: 12, color: '#8b949e' }}>
          No anomalies detected. The system continuously monitors for unusual market behavior.
        </div>
      ) : (
        <div className="sc-anomaly-list">
          {activeAnomalies.slice(0, 10).map((anomaly) => (
            <AnomalyCard key={anomaly.id} anomaly={anomaly} />
          ))}
        </div>
      )}

      {showConfig && <AnomalyConfigModal onClose={() => setShowConfig(false)} />}
    </div>
  );
}
