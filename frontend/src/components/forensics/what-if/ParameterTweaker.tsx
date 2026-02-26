import type { TradeRecord } from '../../../types/backtest';

interface Modifications {
  entry_date: string;
  entry_price: string;
  exit_rule: 'signal' | 'fixed_duration' | 'stop_loss' | 'take_profit' | 'stop_and_tp';
  stop_loss_pct: string;
  take_profit_pct: string;
  trailing_stop_pct: string;
  fixed_duration_days: string;
  position_size: string;
  window_days: string;
}

interface ParameterTweakerProps {
  trade: TradeRecord;
  modifications: Modifications;
  onModify: (key: keyof Modifications, value: string) => void;
  onSimulate: () => void;
  onReset: () => void;
  simulating: boolean;
}

export function ParameterTweaker({
  trade,
  modifications,
  onModify,
  onSimulate,
  onReset,
  simulating,
}: ParameterTweakerProps) {
  return (
    <div className="tf-tweaker">
      <div className="tf-tweaker-section">
        <h5>Modify Entry/Exit</h5>

        <div className="tf-tweaker-field">
          <label className="bt-config-label">Entry Date</label>
          <div className="tf-tweaker-compare">
            <span className="tf-original">{trade.entry_date.slice(0, 10)}</span>
            <span className="tf-arrow">\u2192</span>
            <input
              type="date"
              className="bt-input bt-input-sm"
              value={modifications.entry_date}
              onChange={(e) => onModify('entry_date', e.target.value)}
            />
          </div>
        </div>

        <div className="tf-tweaker-field">
          <label className="bt-config-label">Entry Price</label>
          <div className="tf-tweaker-compare">
            <span className="tf-original">${trade.entry_price.toFixed(2)}</span>
            <span className="tf-arrow">\u2192</span>
            <input
              type="number"
              className="bt-input bt-input-sm"
              placeholder="Market"
              value={modifications.entry_price}
              onChange={(e) => onModify('entry_price', e.target.value)}
              step="0.01"
            />
          </div>
        </div>

        <div className="tf-tweaker-field">
          <label className="bt-config-label">Exit Rule</label>
          <select
            className="bt-select"
            value={modifications.exit_rule}
            onChange={(e) => onModify('exit_rule', e.target.value)}
          >
            <option value="signal">Signal (original)</option>
            <option value="fixed_duration">Fixed Duration</option>
            <option value="stop_loss">Stop-Loss Only</option>
            <option value="take_profit">Take-Profit Only</option>
            <option value="stop_and_tp">Stop-Loss + Take-Profit</option>
          </select>
        </div>

        {(modifications.exit_rule === 'stop_loss' || modifications.exit_rule === 'stop_and_tp') && (
          <div className="tf-tweaker-field">
            <label className="bt-config-label">Stop-Loss (%)</label>
            <input
              type="number"
              className="bt-input bt-input-sm"
              placeholder="e.g., 3"
              value={modifications.stop_loss_pct}
              onChange={(e) => onModify('stop_loss_pct', e.target.value)}
              step="0.5"
              min="0.5"
            />
          </div>
        )}

        {(modifications.exit_rule === 'take_profit' || modifications.exit_rule === 'stop_and_tp') && (
          <div className="tf-tweaker-field">
            <label className="bt-config-label">Take-Profit (%)</label>
            <input
              type="number"
              className="bt-input bt-input-sm"
              placeholder="e.g., 8"
              value={modifications.take_profit_pct}
              onChange={(e) => onModify('take_profit_pct', e.target.value)}
              step="0.5"
              min="0.5"
            />
          </div>
        )}

        <div className="tf-tweaker-field">
          <label className="bt-config-label">Trailing Stop (%)</label>
          <input
            type="number"
            className="bt-input bt-input-sm"
            placeholder="None"
            value={modifications.trailing_stop_pct}
            onChange={(e) => onModify('trailing_stop_pct', e.target.value)}
            step="0.5"
            min="0.5"
          />
        </div>

        {modifications.exit_rule === 'fixed_duration' && (
          <div className="tf-tweaker-field">
            <label className="bt-config-label">Duration (days)</label>
            <input
              type="number"
              className="bt-input bt-input-sm"
              placeholder="e.g., 10"
              value={modifications.fixed_duration_days}
              onChange={(e) => onModify('fixed_duration_days', e.target.value)}
              min="1"
            />
          </div>
        )}
      </div>

      <div className="tf-tweaker-section">
        <h5>Position Sizing</h5>
        <div className="tf-tweaker-field">
          <label className="bt-config-label">Quantity</label>
          <div className="tf-tweaker-compare">
            <span className="tf-original">{trade.quantity}</span>
            <span className="tf-arrow">\u2192</span>
            <input
              type="number"
              className="bt-input bt-input-sm"
              value={modifications.position_size}
              onChange={(e) => onModify('position_size', e.target.value)}
              min="1"
            />
          </div>
        </div>
      </div>

      <div className="tf-tweaker-section">
        <h5>Analysis Window</h5>
        <div className="tf-tweaker-field">
          <label className="bt-config-label">\u00B1 Days</label>
          <input
            type="number"
            className="bt-input bt-input-sm"
            value={modifications.window_days}
            onChange={(e) => onModify('window_days', e.target.value)}
            min="5"
            max="60"
          />
        </div>
      </div>

      <div className="tf-tweaker-actions">
        <button
          className="bt-btn bt-btn-primary"
          onClick={onSimulate}
          disabled={simulating}
        >
          {simulating ? 'Simulating...' : 'Simulate \u25B6'}
        </button>
        <button className="bt-btn bt-btn-secondary" onClick={onReset}>
          Reset to Original
        </button>
      </div>
    </div>
  );
}
