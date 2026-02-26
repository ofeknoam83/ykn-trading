import type { AnalyzeMarketConfig, AnalysisFocus } from '../../../../types/workflow';

interface Props {
  config: AnalyzeMarketConfig;
  onChange: (config: AnalyzeMarketConfig) => void;
  errors: Record<string, string>;
}

const FOCUS_OPTIONS: { value: AnalysisFocus; label: string }[] = [
  { value: 'price_action', label: 'Price Action' },
  { value: 'volume', label: 'Volume' },
  { value: 'technicals', label: 'Technicals' },
  { value: 'news_sentiment', label: 'News Sentiment' },
  { value: 'sector_trends', label: 'Sector Trends' },
];

export function AnalyzeMarketConfigForm({ config, onChange, errors }: Props) {
  function toggleFocus(focus: AnalysisFocus) {
    const next = config.focus_areas.includes(focus)
      ? config.focus_areas.filter(f => f !== focus)
      : [...config.focus_areas, focus];
    onChange({ ...config, focus_areas: next });
  }

  return (
    <div className="step-config-form">
      <label className="config-field">
        <span className="config-label">Assets (comma-separated, empty = all portfolio)</span>
        <input
          type="text"
          value={config.assets.join(', ')}
          onChange={e => onChange({ ...config, assets: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="AAPL, MSFT, GOOGL"
        />
      </label>

      <div className="config-field">
        <span className="config-label">Analysis Depth</span>
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" checked={config.depth === 'brief'} onChange={() => onChange({ ...config, depth: 'brief' })} />
            Brief
          </label>
          <label className="radio-option">
            <input type="radio" checked={config.depth === 'thorough'} onChange={() => onChange({ ...config, depth: 'thorough' })} />
            Thorough
          </label>
        </div>
      </div>

      <div className="config-field">
        <span className="config-label">Focus Areas</span>
        {errors['focus_areas'] && <span className="field-error">{errors['focus_areas']}</span>}
        <div className="checkbox-group">
          {FOCUS_OPTIONS.map(opt => (
            <label key={opt.value} className="checkbox-option">
              <input type="checkbox" checked={config.focus_areas.includes(opt.value)} onChange={() => toggleFocus(opt.value)} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
