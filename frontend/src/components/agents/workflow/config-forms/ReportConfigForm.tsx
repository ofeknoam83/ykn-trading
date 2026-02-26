import type { ReportConfig } from '../../../../types/workflow';

interface Props {
  config: ReportConfig;
  onChange: (config: ReportConfig) => void;
  errors: Record<string, string>;
}

export function ReportConfigForm({ config, onChange }: Props) {
  return (
    <div className="step-config-form">
      <div className="config-field">
        <span className="config-label">Format</span>
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" checked={config.format === 'brief'} onChange={() => onChange({ ...config, format: 'brief' })} />
            Brief
          </label>
          <label className="radio-option">
            <input type="radio" checked={config.format === 'detailed'} onChange={() => onChange({ ...config, format: 'detailed' })} />
            Detailed
          </label>
        </div>
      </div>

      <div className="config-field">
        <span className="config-label">Include</span>
        <div className="checkbox-group">
          <label className="checkbox-option">
            <input type="checkbox" checked={config.include_reasoning_chain} onChange={e => onChange({ ...config, include_reasoning_chain: e.target.checked })} />
            Reasoning Chain
          </label>
          <label className="checkbox-option">
            <input type="checkbox" checked={config.include_portfolio_snapshot} onChange={e => onChange({ ...config, include_portfolio_snapshot: e.target.checked })} />
            Portfolio Snapshot
          </label>
          <label className="checkbox-option">
            <input type="checkbox" checked={config.include_market_summary} onChange={e => onChange({ ...config, include_market_summary: e.target.checked })} />
            Market Summary
          </label>
        </div>
      </div>

      <div className="config-field">
        <span className="config-label">Delivery</span>
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" checked={config.delivery === 'store'} onChange={() => onChange({ ...config, delivery: 'store' })} />
            Store
          </label>
          <label className="radio-option">
            <input type="radio" checked={config.delivery === 'log_only'} onChange={() => onChange({ ...config, delivery: 'log_only' })} />
            Log Only
          </label>
        </div>
      </div>
    </div>
  );
}
