import type { OptimizationParameter } from '../../../types/backtest';
import { OPTIMIZATION_METRICS } from '../../../types/backtest';

interface OptimizerConfigProps {
  targetMetric: string;
  onTargetMetricChange: (metric: string) => void;
  parameters: OptimizationParameter[];
  onParametersChange: (params: OptimizationParameter[]) => void;
}

const AVAILABLE_PARAMS = [
  { key: 'lookback_period', label: 'Lookback Period', type: 'range' as const },
  { key: 'rebalance_frequency', label: 'Rebalance Frequency', type: 'enum' as const, enumValues: ['daily', 'weekly', 'monthly', 'quarterly'] },
  { key: 'fast_period', label: 'Fast SMA Period', type: 'range' as const },
  { key: 'slow_period', label: 'Slow SMA Period', type: 'range' as const },
  { key: 'top_n', label: 'Top-N Holdings', type: 'range' as const },
  { key: 'z_score_threshold', label: 'Z-Score Threshold', type: 'range' as const },
  { key: 'stop_loss_pct', label: 'Stop Loss %', type: 'range' as const },
  { key: 'take_profit_pct', label: 'Take Profit %', type: 'range' as const },
];

export function OptimizerConfig({
  targetMetric,
  onTargetMetricChange,
  parameters,
  onParametersChange,
}: OptimizerConfigProps) {
  function addParameter() {
    if (parameters.length >= 3) return;
    const used = new Set(parameters.map((p) => p.key));
    const available = AVAILABLE_PARAMS.find((p) => !used.has(p.key));
    if (!available) return;

    const newParam: OptimizationParameter = {
      key: available.key,
      label: available.label,
      type: available.type,
      ...(available.type === 'range' ? { from: 10, to: 100, step: 10 } : {}),
      ...(available.type === 'enum' && available.enumValues ? { values: available.enumValues } : {}),
    };
    onParametersChange([...parameters, newParam]);
  }

  function removeParameter(index: number) {
    onParametersChange(parameters.filter((_, i) => i !== index));
  }

  function updateParameter(index: number, updates: Partial<OptimizationParameter>) {
    const newParams = [...parameters];
    newParams[index] = { ...newParams[index], ...updates };
    onParametersChange(newParams);
  }

  function updateParamKey(index: number, key: string) {
    const def = AVAILABLE_PARAMS.find((p) => p.key === key);
    if (!def) return;
    const newParam: OptimizationParameter = {
      key: def.key,
      label: def.label,
      type: def.type,
      ...(def.type === 'range' ? { from: 10, to: 100, step: 10 } : {}),
      ...(def.type === 'enum' && def.enumValues ? { values: def.enumValues } : {}),
    };
    const newParams = [...parameters];
    newParams[index] = newParam;
    onParametersChange(newParams);
  }

  const usedKeys = new Set(parameters.map((p) => p.key));

  return (
    <div className="bt-optimizer-config">
      <h4 className="bt-config-section-title">Optimization</h4>

      <div className="bt-config-section">
        <label className="bt-config-label">Target Metric</label>
        <select
          className="bt-select"
          value={targetMetric}
          onChange={(e) => onTargetMetricChange(e.target.value)}
        >
          {OPTIMIZATION_METRICS.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>

      {parameters.map((param, index) => (
        <div key={index} className="bt-param-row">
          <div className="bt-param-header">
            <select
              className="bt-select bt-select-sm"
              value={param.key}
              onChange={(e) => updateParamKey(index, e.target.value)}
            >
              {AVAILABLE_PARAMS.filter((p) => p.key === param.key || !usedKeys.has(p.key)).map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
            <button
              className="bt-btn-icon bt-btn-remove"
              onClick={() => removeParameter(index)}
              title="Remove parameter"
            >
              \u00D7
            </button>
          </div>

          {param.type === 'range' && (
            <div className="bt-range-inputs">
              <label>
                From
                <input
                  type="number"
                  className="bt-input bt-input-xs"
                  value={param.from ?? 10}
                  onChange={(e) => updateParameter(index, { from: Number(e.target.value) })}
                />
              </label>
              <label>
                To
                <input
                  type="number"
                  className="bt-input bt-input-xs"
                  value={param.to ?? 100}
                  onChange={(e) => updateParameter(index, { to: Number(e.target.value) })}
                />
              </label>
              <label>
                Step
                <input
                  type="number"
                  className="bt-input bt-input-xs"
                  value={param.step ?? 10}
                  min={1}
                  onChange={(e) => updateParameter(index, { step: Number(e.target.value) })}
                />
              </label>
              <span className="bt-param-count">
                {param.from != null && param.to != null && param.step
                  ? `${Math.floor((param.to - param.from) / param.step + 1)} values`
                  : ''}
              </span>
            </div>
          )}

          {param.type === 'enum' && (
            <div className="bt-enum-checkboxes">
              {(AVAILABLE_PARAMS.find((p) => p.key === param.key) as { enumValues?: string[] })?.enumValues?.map((val) => (
                <label key={val} className="bt-checkbox-label">
                  <input
                    type="checkbox"
                    checked={param.values?.includes(val) ?? false}
                    onChange={(e) => {
                      const current = param.values ?? [];
                      const newValues = e.target.checked
                        ? [...current, val]
                        : current.filter((v) => v !== val);
                      updateParameter(index, { values: newValues });
                    }}
                  />
                  {val}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      {parameters.length < 3 && (
        <button className="bt-btn bt-btn-secondary bt-btn-add-param" onClick={addParameter}>
          + Add Parameter
        </button>
      )}
    </div>
  );
}
