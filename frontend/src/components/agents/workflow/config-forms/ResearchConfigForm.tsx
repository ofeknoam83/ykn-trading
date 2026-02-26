import type { ResearchConfig } from '../../../../types/workflow';

interface Props {
  config: ResearchConfig;
  onChange: (config: ResearchConfig) => void;
  errors: Record<string, string>;
}

export function ResearchConfigForm({ config, onChange }: Props) {
  return (
    <div className="step-config-form">
      <div className="config-field">
        <span className="config-label">Scope</span>
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" checked={config.scope === 'single_asset'} onChange={() => onChange({ ...config, scope: 'single_asset' })} />
            Single Asset
          </label>
          <label className="radio-option">
            <input type="radio" checked={config.scope === 'sector'} onChange={() => onChange({ ...config, scope: 'sector' })} />
            Sector
          </label>
          <label className="radio-option">
            <input type="radio" checked={config.scope === 'market_wide'} onChange={() => onChange({ ...config, scope: 'market_wide' })} />
            Market Wide
          </label>
        </div>
      </div>

      {config.scope === 'single_asset' && (
        <label className="config-field">
          <span className="config-label">Target Assets (comma-separated)</span>
          <input
            type="text"
            value={(config.target_assets ?? []).join(', ')}
            onChange={e => onChange({ ...config, target_assets: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="AAPL, MSFT"
          />
        </label>
      )}

      {config.scope === 'sector' && (
        <label className="config-field">
          <span className="config-label">Target Sector</span>
          <input
            type="text"
            value={config.target_sector ?? ''}
            onChange={e => onChange({ ...config, target_sector: e.target.value })}
            placeholder="Technology"
          />
        </label>
      )}

      <div className="config-field">
        <span className="config-label">Time Horizon</span>
        <select
          value={config.time_horizon}
          onChange={e => onChange({ ...config, time_horizon: e.target.value as ResearchConfig['time_horizon'] })}
        >
          <option value="1d">1 Day</option>
          <option value="1w">1 Week</option>
          <option value="1m">1 Month</option>
          <option value="3m">3 Months</option>
        </select>
      </div>

      <div className="config-field">
        <span className="config-label">Include</span>
        <div className="checkbox-group">
          <label className="checkbox-option">
            <input type="checkbox" checked={config.include_fundamentals} onChange={e => onChange({ ...config, include_fundamentals: e.target.checked })} />
            Fundamentals
          </label>
          <label className="checkbox-option">
            <input type="checkbox" checked={config.include_news} onChange={e => onChange({ ...config, include_news: e.target.checked })} />
            News
          </label>
          <label className="checkbox-option">
            <input type="checkbox" checked={config.include_technicals} onChange={e => onChange({ ...config, include_technicals: e.target.checked })} />
            Technicals
          </label>
        </div>
      </div>
    </div>
  );
}
