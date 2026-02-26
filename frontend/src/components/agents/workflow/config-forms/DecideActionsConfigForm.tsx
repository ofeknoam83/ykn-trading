import type { DecideActionsConfig } from '../../../../types/workflow';

interface Props {
  config: DecideActionsConfig;
  onChange: (config: DecideActionsConfig) => void;
  errors: Record<string, string>;
}

const ACTION_OPTIONS = ['buy', 'sell', 'hold', 'increase', 'decrease'] as const;

export function DecideActionsConfigForm({ config, onChange, errors }: Props) {
  function toggleAction(action: typeof ACTION_OPTIONS[number]) {
    const next = config.allowed_actions.includes(action)
      ? config.allowed_actions.filter(a => a !== action)
      : [...config.allowed_actions, action];
    onChange({ ...config, allowed_actions: next });
  }

  return (
    <div className="step-config-form">
      <label className="config-field">
        <span className="config-label">Confidence Threshold: {config.confidence_threshold}%</span>
        <input
          type="range"
          min={0}
          max={100}
          value={config.confidence_threshold}
          onChange={e => onChange({ ...config, confidence_threshold: parseInt(e.target.value) })}
        />
      </label>

      <label className="config-field">
        <span className="config-label">Max Trades Per Run</span>
        <input
          type="number"
          min={1}
          max={50}
          value={config.max_trades_per_run}
          onChange={e => onChange({ ...config, max_trades_per_run: parseInt(e.target.value) || 5 })}
        />
      </label>

      <label className="config-field">
        <span className="config-label">Max Position Size %</span>
        <input
          type="number"
          min={1}
          max={100}
          value={config.max_position_size_pct}
          onChange={e => onChange({ ...config, max_position_size_pct: parseFloat(e.target.value) || 10 })}
        />
      </label>

      <div className="config-field">
        <span className="config-label">Allowed Actions</span>
        {errors['allowed_actions'] && <span className="field-error">{errors['allowed_actions']}</span>}
        <div className="checkbox-group">
          {ACTION_OPTIONS.map(action => (
            <label key={action} className="checkbox-option">
              <input type="checkbox" checked={config.allowed_actions.includes(action)} onChange={() => toggleAction(action)} />
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <label className="config-field toggle-field">
        <input
          type="checkbox"
          checked={config.require_reasoning}
          onChange={e => onChange({ ...config, require_reasoning: e.target.checked })}
        />
        <span>Require Reasoning for Each Decision</span>
      </label>
    </div>
  );
}
