import { useScannerStore } from '../stores/scannerStore';
import * as scannerApi from '../../../api/scannerApi';
import type { AnomalyConfig } from '../types/scanner.types';

interface AnomalyConfigModalProps {
  onClose: () => void;
}

const CONFIG_ROWS: { key: keyof Omit<AnomalyConfig, 'cooldownHours'>; label: string }[] = [
  { key: 'correlationBreaks', label: 'Correlation Breaks' },
  { key: 'volumeAnomalies', label: 'Volume Anomalies' },
  { key: 'volatilityDivergence', label: 'Volatility Divergence' },
  { key: 'sectorRotation', label: 'Sector Rotation' },
  { key: 'priceVolumeDivergence', label: 'Price-Volume Divergence' },
  { key: 'crossAssetSignals', label: 'Cross-Asset Signals' },
  { key: 'breadthDivergence', label: 'Breadth Divergence' },
];

export function AnomalyConfigModal({ onClose }: AnomalyConfigModalProps) {
  const { anomalyConfig, setAnomalyConfig } = useScannerStore();

  const updateField = (key: keyof Omit<AnomalyConfig, 'cooldownHours'>, field: 'enabled' | 'sigma', value: boolean | number) => {
    const updated = {
      ...anomalyConfig,
      [key]: { ...anomalyConfig[key], [field]: value },
    };
    setAnomalyConfig(updated);
  };

  const handleSave = async () => {
    try {
      await scannerApi.updateAnomalyConfig(anomalyConfig);
    } catch { /* fail silently */ }
    onClose();
  };

  return (
    <>
      <div className="sc-action-menu-overlay" onClick={onClose} />
      <div className="sc-anomaly-config-modal">
        <div style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>
          Anomaly Detection Settings
        </div>

        {CONFIG_ROWS.map(({ key, label }) => (
          <div key={key} className="sc-anomaly-config-row">
            <span className="sc-anomaly-config-label">{label}</span>
            <div className="sc-anomaly-config-controls">
              <select
                value={anomalyConfig[key].enabled ? 'on' : 'off'}
                onChange={(e) => updateField(key, 'enabled', e.target.value === 'on')}
                style={{ padding: '2px 6px', fontSize: 12, background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3' }}
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
              {anomalyConfig[key].enabled && (
                <>
                  <span style={{ fontSize: 12, color: '#8b949e' }}>&sigma;:</span>
                  <input
                    type="number"
                    value={anomalyConfig[key].sigma}
                    onChange={(e) => updateField(key, 'sigma', Number(e.target.value))}
                    min={1}
                    max={5}
                    step={0.5}
                    style={{ width: 50, padding: '2px 6px', fontSize: 12, background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3' }}
                  />
                </>
              )}
            </div>
          </div>
        ))}

        <div className="sc-anomaly-config-row" style={{ borderBottom: 'none' }}>
          <span className="sc-anomaly-config-label">Cooldown</span>
          <div className="sc-anomaly-config-controls">
            <select
              value={anomalyConfig.cooldownHours}
              onChange={(e) => setAnomalyConfig({ ...anomalyConfig, cooldownHours: Number(e.target.value) })}
              style={{ padding: '2px 6px', fontSize: 12, background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3' }}
            >
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={4}>4 hours</option>
              <option value={8}>8 hours</option>
              <option value={24}>24 hours</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="sc-toolbar-btn" onClick={onClose}>Cancel</button>
          <button className="sc-toolbar-btn sc-toolbar-btn--primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </>
  );
}
