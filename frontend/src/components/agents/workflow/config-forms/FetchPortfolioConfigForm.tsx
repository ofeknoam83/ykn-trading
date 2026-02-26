import type { FetchPortfolioConfig } from '../../../../types/workflow';

interface Props {
  config: FetchPortfolioConfig;
  onChange: (config: FetchPortfolioConfig) => void;
  errors: Record<string, string>;
}

export function FetchPortfolioConfigForm({ config, onChange }: Props) {
  return (
    <div className="step-config-form">
      <label className="config-field toggle-field">
        <input
          type="checkbox"
          checked={config.include_open_orders}
          onChange={e => onChange({ ...config, include_open_orders: e.target.checked })}
        />
        <span>Include Open Orders</span>
      </label>

      <label className="config-field toggle-field">
        <input
          type="checkbox"
          checked={config.include_historical_positions}
          onChange={e => onChange({ ...config, include_historical_positions: e.target.checked })}
        />
        <span>Include Historical Positions</span>
      </label>

      {config.include_historical_positions && (
        <label className="config-field">
          <span className="config-label">Lookback Days</span>
          <input
            type="number"
            min={1}
            max={365}
            value={config.lookback_days ?? 30}
            onChange={e => onChange({ ...config, lookback_days: parseInt(e.target.value) || 30 })}
          />
        </label>
      )}
    </div>
  );
}
