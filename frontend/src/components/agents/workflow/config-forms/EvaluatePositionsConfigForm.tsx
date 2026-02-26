import type { EvaluatePositionsConfig } from '../../../../types/workflow';

interface Props {
  config: EvaluatePositionsConfig;
  onChange: (config: EvaluatePositionsConfig) => void;
  errors: Record<string, string>;
}

export function EvaluatePositionsConfigForm({ config, onChange }: Props) {
  return (
    <div className="step-config-form">
      <fieldset className="config-fieldset">
        <legend>Risk Thresholds</legend>

        <label className="config-field">
          <span className="config-label">Max Position % of Portfolio</span>
          <input
            type="number"
            min={1}
            max={100}
            value={config.risk_thresholds.max_position_pct}
            onChange={e => onChange({
              ...config,
              risk_thresholds: { ...config.risk_thresholds, max_position_pct: parseFloat(e.target.value) || 10 },
            })}
          />
        </label>

        <label className="config-field">
          <span className="config-label">Max Drawdown %</span>
          <input
            type="number"
            min={1}
            max={100}
            value={config.risk_thresholds.max_drawdown_pct}
            onChange={e => onChange({
              ...config,
              risk_thresholds: { ...config.risk_thresholds, max_drawdown_pct: parseFloat(e.target.value) || 5 },
            })}
          />
        </label>

        <label className="config-field">
          <span className="config-label">Stop Loss % (optional)</span>
          <input
            type="number"
            min={0.1}
            max={100}
            step={0.1}
            value={config.risk_thresholds.stop_loss_pct ?? ''}
            onChange={e => {
              const val = e.target.value ? parseFloat(e.target.value) : undefined;
              onChange({
                ...config,
                risk_thresholds: { ...config.risk_thresholds, stop_loss_pct: val },
              });
            }}
            placeholder="Not set"
          />
        </label>
      </fieldset>

      <fieldset className="config-fieldset">
        <legend>Profit Targets</legend>
        <label className="config-field">
          <span className="config-label">Take Profit % (optional)</span>
          <input
            type="number"
            min={0.1}
            max={1000}
            step={0.1}
            value={config.profit_targets.take_profit_pct ?? ''}
            onChange={e => {
              const val = e.target.value ? parseFloat(e.target.value) : undefined;
              onChange({ ...config, profit_targets: { take_profit_pct: val } });
            }}
            placeholder="Not set"
          />
        </label>
      </fieldset>

      <div className="config-field">
        <span className="config-label">Evaluate Against</span>
        <select
          value={config.evaluate_against}
          onChange={e => onChange({ ...config, evaluate_against: e.target.value as EvaluatePositionsConfig['evaluate_against'] })}
        >
          <option value="entry_price">Entry Price</option>
          <option value="recent_high">Recent High</option>
          <option value="moving_average">Moving Average</option>
        </select>
      </div>
    </div>
  );
}
