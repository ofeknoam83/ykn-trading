import { useState } from 'react';
import type { AlertType, AlertRule } from '../../../types/portfolio';
import { createAlertRule } from '../../../api/portfolioApi';

interface Props {
  onClose: () => void;
  onCreated: () => void;
  prefillSymbol?: string;
}

const ALERT_TYPES: { key: AlertType; label: string; description: string }[] = [
  { key: 'price_cross', label: 'Price Cross', description: 'Alert when price crosses a level' },
  { key: 'pnl_threshold', label: 'P&L Threshold', description: 'Alert when P&L hits a threshold' },
  { key: 'position_size', label: 'Position Size', description: 'Alert when position exceeds weight' },
  { key: 'drawdown', label: 'Drawdown', description: 'Alert on max drawdown' },
  { key: 'concentration', label: 'Concentration', description: 'Alert on concentration breaches' },
  { key: 'margin', label: 'Margin Usage', description: 'Alert when margin exceeds threshold' },
  { key: 'agent_error', label: 'Agent Error', description: 'Alert when an agent encounters an error' },
  { key: 'strategy_error', label: 'Strategy Error', description: 'Alert when a strategy encounters an error' },
];

export function AlertConfigModal({ onClose, onCreated, prefillSymbol }: Props) {
  const [alertType, setAlertType] = useState<AlertType>('price_cross');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState(prefillSymbol ?? '');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [threshold, setThreshold] = useState('');
  const [action] = useState<'notify'>('notify');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError('Alert name is required');
      return;
    }
    const thresholdNum = parseFloat(threshold);
    if (!Number.isFinite(thresholdNum) || thresholdNum <= 0) {
      setError('Valid threshold is required');
      return;
    }

    setSaving(true);
    setError(null);

    let config: AlertRule['config'];
    switch (alertType) {
      case 'price_cross':
        config = { type: 'price_cross', symbol, direction, price: thresholdNum };
        break;
      case 'pnl_threshold':
        config = { type: 'pnl_threshold', scope: 'portfolio', direction, percent: thresholdNum };
        break;
      case 'drawdown':
        config = { type: 'drawdown', scope: 'portfolio', max_drawdown_pct: thresholdNum };
        break;
      case 'position_size':
        config = { type: 'position_size', symbol, max_weight_pct: thresholdNum };
        break;
      case 'concentration':
        config = { type: 'concentration', dimension: 'sector', max_pct: thresholdNum };
        break;
      case 'margin':
        config = { type: 'margin', max_usage_pct: thresholdNum };
        break;
      case 'agent_error':
        config = { type: 'agent_error', agent_id: symbol };
        break;
      case 'strategy_error':
        config = { type: 'strategy_error', strategy_id: symbol };
        break;
      default:
        config = { type: 'price_cross', symbol, direction, price: thresholdNum };
    }

    try {
      await createAlertRule({
        name,
        enabled: true,
        type: alertType,
        config,
        actions: [{ type: action }],
        cooldown_minutes: 15,
      });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create alert');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="poc-dialog-overlay" onClick={onClose}>
      <div className="poc-dialog poc-dialog-wide" onClick={(e) => e.stopPropagation()}>
        <h4>Create Alert</h4>

        <div className="poc-form-group">
          <label>Alert Name</label>
          <input
            className="poc-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., AAPL price alert"
          />
        </div>

        <div className="poc-form-group">
          <label>Alert Type</label>
          <div className="poc-alert-type-grid">
            {ALERT_TYPES.map((t) => (
              <button
                key={t.key}
                className={`poc-alert-type-btn ${alertType === t.key ? 'active' : ''}`}
                onClick={() => setAlertType(t.key)}
              >
                <span className="poc-alert-type-label">{t.label}</span>
                <span className="poc-alert-type-desc">{t.description}</span>
              </button>
            ))}
          </div>
        </div>

        {(alertType === 'price_cross' || alertType === 'position_size') && (
          <div className="poc-form-group">
            <label>Symbol</label>
            <input
              className="poc-input"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
            />
          </div>
        )}

        {(alertType === 'price_cross' || alertType === 'pnl_threshold') && (
          <div className="poc-form-group">
            <label>Direction</label>
            <div className="poc-pill-group">
              <button
                className={`poc-pill ${direction === 'above' ? 'active' : ''}`}
                onClick={() => setDirection('above')}
              >
                Above
              </button>
              <button
                className={`poc-pill ${direction === 'below' ? 'active' : ''}`}
                onClick={() => setDirection('below')}
              >
                Below
              </button>
            </div>
          </div>
        )}

        <div className="poc-form-group">
          <label>Threshold</label>
          <input
            className="poc-input"
            type="number"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder={alertType === 'price_cross' ? 'Price' : 'Percentage'}
          />
        </div>

        <div className="poc-form-group">
          <label>Action</label>
          <div className="poc-pill-group">
            <button className={`poc-pill ${action === 'notify' ? 'active' : ''}`}>
              Notify Only
            </button>
          </div>
        </div>

        {error && <p className="poc-form-error">{error}</p>}

        <div className="poc-dialog-actions">
          <button className="poc-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="poc-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Creating...' : 'Create Alert'}
          </button>
        </div>
      </div>
    </div>
  );
}
