import type { ConditionConfig, ConditionType } from '../../../../types/workflow';

interface Props {
  config: ConditionConfig;
  onChange: (config: ConditionConfig) => void;
  errors: Record<string, string>;
}

const CONDITION_TYPES: { value: ConditionType; label: string }[] = [
  { value: 'volatility_above', label: 'Volatility Above Threshold' },
  { value: 'position_count_above', label: 'Position Count Above' },
  { value: 'portfolio_pnl_above', label: 'Portfolio PnL Above %' },
  { value: 'portfolio_pnl_below', label: 'Portfolio PnL Below %' },
  { value: 'market_session', label: 'Market Session Is' },
  { value: 'news_sentiment', label: 'News Sentiment Is' },
  { value: 'time_window', label: 'Time Window' },
  { value: 'custom_expression', label: 'Custom Expression' },
];

const SESSION_OPTIONS = ['pre_market', 'open', 'after_hours', 'closed'];
const SENTIMENT_OPTIONS = ['bullish', 'bearish', 'neutral'];
const TIMEZONES = ['US/Eastern', 'US/Central', 'US/Pacific', 'UTC', 'Europe/London', 'Asia/Tokyo', 'Europe/Berlin'];

function defaultParamsForType(type: ConditionType): Record<string, unknown> {
  switch (type) {
    case 'volatility_above': return { threshold: 25 };
    case 'position_count_above': return { threshold: 10 };
    case 'portfolio_pnl_above': return { threshold_pct: 5 };
    case 'portfolio_pnl_below': return { threshold_pct: -5 };
    case 'market_session': return { session: 'open' };
    case 'news_sentiment': return { sentiment: 'bullish' };
    case 'time_window': return { start_hour: 9, end_hour: 16, timezone: 'US/Eastern' };
    case 'custom_expression': return { expression: '' };
    default: return {};
  }
}

export function ConditionConfigForm({ config, onChange }: Props) {
  function setParam(key: string, value: unknown) {
    onChange({ ...config, params: { ...config.params, [key]: value } });
  }

  function onTypeChange(type: ConditionType) {
    onChange({
      ...config,
      condition_type: type,
      params: defaultParamsForType(type),
    });
  }

  return (
    <div className="step-config-form">
      <div className="config-field">
        <span className="config-label">Condition Type</span>
        <select
          value={config.condition_type}
          onChange={e => onTypeChange(e.target.value as ConditionType)}
        >
          {CONDITION_TYPES.map(ct => (
            <option key={ct.value} value={ct.value}>{ct.label}</option>
          ))}
        </select>
      </div>

      {config.condition_type === 'volatility_above' && (
        <label className="config-field">
          <span className="config-label">VIX Threshold</span>
          <input
            type="number"
            min={0}
            max={100}
            value={(config.params.threshold as number) ?? 25}
            onChange={e => setParam('threshold', parseFloat(e.target.value) || 25)}
          />
        </label>
      )}

      {config.condition_type === 'position_count_above' && (
        <label className="config-field">
          <span className="config-label">Max Positions</span>
          <input
            type="number"
            min={0}
            max={1000}
            value={(config.params.threshold as number) ?? 10}
            onChange={e => setParam('threshold', parseInt(e.target.value) || 10)}
          />
        </label>
      )}

      {(config.condition_type === 'portfolio_pnl_above' || config.condition_type === 'portfolio_pnl_below') && (
        <label className="config-field">
          <span className="config-label">PnL Threshold %</span>
          <input
            type="number"
            step={0.1}
            value={(config.params.threshold_pct as number) ?? 5}
            onChange={e => setParam('threshold_pct', parseFloat(e.target.value) || 0)}
          />
        </label>
      )}

      {config.condition_type === 'market_session' && (
        <div className="config-field">
          <span className="config-label">Session</span>
          <select
            value={(config.params.session as string) ?? 'open'}
            onChange={e => setParam('session', e.target.value)}
          >
            {SESSION_OPTIONS.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      )}

      {config.condition_type === 'news_sentiment' && (
        <>
          <div className="config-field">
            <span className="config-label">Sentiment</span>
            <select
              value={(config.params.sentiment as string) ?? 'bullish'}
              onChange={e => setParam('sentiment', e.target.value)}
            >
              {SENTIMENT_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <label className="config-field">
            <span className="config-label">Symbol (optional)</span>
            <input
              type="text"
              value={(config.params.symbol as string) ?? ''}
              onChange={e => setParam('symbol', e.target.value || undefined)}
              placeholder="AAPL"
            />
          </label>
        </>
      )}

      {config.condition_type === 'time_window' && (
        <>
          <label className="config-field">
            <span className="config-label">Start Hour (0-23)</span>
            <input
              type="number"
              min={0}
              max={23}
              value={(config.params.start_hour as number) ?? 9}
              onChange={e => setParam('start_hour', parseInt(e.target.value) || 0)}
            />
          </label>
          <label className="config-field">
            <span className="config-label">End Hour (0-23)</span>
            <input
              type="number"
              min={0}
              max={23}
              value={(config.params.end_hour as number) ?? 16}
              onChange={e => setParam('end_hour', parseInt(e.target.value) || 0)}
            />
          </label>
          <div className="config-field">
            <span className="config-label">Timezone</span>
            <select
              value={(config.params.timezone as string) ?? 'US/Eastern'}
              onChange={e => setParam('timezone', e.target.value)}
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {config.condition_type === 'custom_expression' && (
        <label className="config-field">
          <span className="config-label">Expression</span>
          <textarea
            value={(config.params.expression as string) ?? ''}
            onChange={e => setParam('expression', e.target.value)}
            placeholder="Custom condition expression..."
            rows={3}
          />
        </label>
      )}

      <hr className="config-divider" />

      <label className="config-field">
        <span className="config-label">True Branch Label</span>
        <input
          type="text"
          value={config.true_label ?? 'Yes'}
          onChange={e => onChange({ ...config, true_label: e.target.value })}
          placeholder="Yes"
        />
      </label>

      <label className="config-field">
        <span className="config-label">False Branch Label</span>
        <input
          type="text"
          value={config.false_label ?? 'No'}
          onChange={e => onChange({ ...config, false_label: e.target.value })}
          placeholder="No"
        />
      </label>
    </div>
  );
}
