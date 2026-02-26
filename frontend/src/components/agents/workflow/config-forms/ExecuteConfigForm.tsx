import type { ExecuteConfig } from '../../../../types/workflow';

interface Props {
  config: ExecuteConfig;
  onChange: (config: ExecuteConfig) => void;
  errors: Record<string, string>;
}

const ORDER_TYPES = ['market', 'limit', 'stop'] as const;

export function ExecuteConfigForm({ config, onChange, errors }: Props) {
  function toggleOrderType(ot: typeof ORDER_TYPES[number]) {
    const next = config.order_types_allowed.includes(ot)
      ? config.order_types_allowed.filter(t => t !== ot)
      : [...config.order_types_allowed, ot];
    onChange({ ...config, order_types_allowed: next });
  }

  return (
    <div className="step-config-form">
      <div className="config-field">
        <span className="config-label">Approval Mode</span>
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" checked={config.approval_mode === 'human_approval'} onChange={() => onChange({ ...config, approval_mode: 'human_approval' })} />
            Human Approval
          </label>
          <label className="radio-option">
            <input type="radio" checked={config.approval_mode === 'auto'} onChange={() => onChange({ ...config, approval_mode: 'auto' })} />
            Auto Execute
          </label>
        </div>
      </div>

      <div className="config-field">
        <span className="config-label">Order Types Allowed</span>
        {errors['order_types_allowed'] && <span className="field-error">{errors['order_types_allowed']}</span>}
        <div className="checkbox-group">
          {ORDER_TYPES.map(ot => (
            <label key={ot} className="checkbox-option">
              <input type="checkbox" checked={config.order_types_allowed.includes(ot)} onChange={() => toggleOrderType(ot)} />
              {ot.charAt(0).toUpperCase() + ot.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="config-field">
        <span className="config-label">Default Order Type</span>
        <select
          value={config.default_order_type}
          onChange={e => onChange({ ...config, default_order_type: e.target.value as ExecuteConfig['default_order_type'] })}
        >
          {ORDER_TYPES.map(ot => (
            <option key={ot} value={ot}>{ot.charAt(0).toUpperCase() + ot.slice(1)}</option>
          ))}
        </select>
      </div>

      {config.order_types_allowed.includes('limit') && (
        <label className="config-field">
          <span className="config-label">Limit Offset (basis points)</span>
          <input
            type="number"
            min={0}
            max={500}
            value={config.limit_offset_bps ?? 10}
            onChange={e => onChange({ ...config, limit_offset_bps: parseInt(e.target.value) || 10 })}
          />
        </label>
      )}

      <label className="config-field toggle-field">
        <input
          type="checkbox"
          checked={config.dry_run_first}
          onChange={e => onChange({ ...config, dry_run_first: e.target.checked })}
        />
        <span>Dry Run First (log before executing)</span>
      </label>
    </div>
  );
}
