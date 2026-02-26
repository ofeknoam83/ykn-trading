import type { RunMode, TriggerConfig, TriggerType } from '../../../types/workflow';

interface RunModeConfigProps {
  runMode: RunMode;
  triggerConfig?: TriggerConfig;
  onRunModeChange: (mode: RunMode) => void;
  onTriggerConfigChange: (config: TriggerConfig) => void;
}

const INTERVAL_PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '4h', minutes: 240 },
  { label: 'Daily', minutes: 1440 },
];

const TRIGGER_TYPES: { value: TriggerType; label: string }[] = [
  { value: 'price_cross', label: 'Price Cross' },
  { value: 'news_keyword', label: 'News Keyword' },
  { value: 'portfolio_delta', label: 'Portfolio Delta' },
  { value: 'volatility_spike', label: 'Volatility Spike' },
  { value: 'time_of_day', label: 'Time of Day' },
];

const TIMEZONES = ['US/Eastern', 'US/Central', 'US/Pacific', 'UTC', 'Europe/London', 'Asia/Tokyo'];

export function RunModeConfig({ runMode, triggerConfig, onRunModeChange, onTriggerConfigChange }: RunModeConfigProps) {
  const schedule = triggerConfig?.schedule;
  const trigger = triggerConfig?.trigger;

  return (
    <div className="wf-run-mode">
      <div className="wf-run-mode-selector">
        <span className="wf-run-mode-label">Run Mode:</span>
        <div className="wf-run-mode-options">
          {(['once', 'scheduled', 'triggered'] as RunMode[]).map(mode => (
            <label key={mode} className={`wf-run-mode-option ${runMode === mode ? 'active' : ''}`}>
              <input
                type="radio"
                name="runMode"
                checked={runMode === mode}
                onChange={() => onRunModeChange(mode)}
              />
              {mode === 'once' ? 'Run Once' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {runMode === 'scheduled' && (
        <div className="wf-schedule-config">
          <div className="wf-interval-presets">
            {INTERVAL_PRESETS.map(p => (
              <button
                key={p.minutes}
                className={`wf-interval-btn ${schedule?.type === 'interval' && schedule.interval_minutes === p.minutes ? 'active' : ''}`}
                onClick={() => onTriggerConfigChange({
                  ...triggerConfig,
                  schedule: { type: 'interval', interval_minutes: p.minutes },
                })}
              >
                {p.label}
              </button>
            ))}
            <button
              className={`wf-interval-btn ${schedule?.type === 'cron' ? 'active' : ''}`}
              onClick={() => onTriggerConfigChange({
                ...triggerConfig,
                schedule: { type: 'cron', cron_expression: schedule?.cron_expression || '0 */4 * * *' },
              })}
            >
              Custom
            </button>
          </div>

          {schedule?.type === 'cron' && (
            <label className="wf-cron-input">
              <span>Cron Expression:</span>
              <input
                type="text"
                value={schedule.cron_expression ?? ''}
                onChange={e => onTriggerConfigChange({
                  ...triggerConfig,
                  schedule: { ...schedule, cron_expression: e.target.value },
                })}
                placeholder="0 */4 * * *"
              />
              <span className="wf-cron-hint">e.g. "30 9 * * 1-5" = Weekdays at 9:30 AM</span>
            </label>
          )}
        </div>
      )}

      {runMode === 'triggered' && (
        <div className="wf-trigger-config">
          <select
            className="wf-trigger-type-select"
            value={trigger?.type ?? 'price_cross'}
            onChange={e => onTriggerConfigChange({
              ...triggerConfig,
              trigger: { type: e.target.value as TriggerType, params: {} },
            })}
          >
            {TRIGGER_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {trigger?.type === 'price_cross' && (
            <div className="wf-trigger-params">
              <input
                type="text"
                placeholder="Symbol (e.g. AAPL)"
                value={(trigger.params.symbol as string) ?? ''}
                onChange={e => onTriggerConfigChange({
                  ...triggerConfig,
                  trigger: { ...trigger, params: { ...trigger.params, symbol: e.target.value } },
                })}
              />
              <input
                type="number"
                placeholder="Threshold"
                value={(trigger.params.threshold as number) ?? ''}
                onChange={e => onTriggerConfigChange({
                  ...triggerConfig,
                  trigger: { ...trigger, params: { ...trigger.params, threshold: parseFloat(e.target.value) } },
                })}
              />
              <select
                value={(trigger.params.direction as string) ?? 'above'}
                onChange={e => onTriggerConfigChange({
                  ...triggerConfig,
                  trigger: { ...trigger, params: { ...trigger.params, direction: e.target.value } },
                })}
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
          )}

          {trigger?.type === 'news_keyword' && (
            <div className="wf-trigger-params">
              <input
                type="text"
                placeholder="Keywords (comma-separated)"
                value={((trigger.params.keywords as string[]) ?? []).join(', ')}
                onChange={e => onTriggerConfigChange({
                  ...triggerConfig,
                  trigger: { ...trigger, params: { ...trigger.params, keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } },
                })}
              />
            </div>
          )}

          {trigger?.type === 'portfolio_delta' && (
            <div className="wf-trigger-params">
              <input
                type="number"
                placeholder="Max delta %"
                value={(trigger.params.max_delta as number) ?? ''}
                onChange={e => onTriggerConfigChange({
                  ...triggerConfig,
                  trigger: { ...trigger, params: { max_delta: parseFloat(e.target.value) } },
                })}
              />
            </div>
          )}

          {trigger?.type === 'volatility_spike' && (
            <div className="wf-trigger-params">
              <input
                type="number"
                placeholder="VIX threshold"
                value={(trigger.params.vix_threshold as number) ?? ''}
                onChange={e => onTriggerConfigChange({
                  ...triggerConfig,
                  trigger: { ...trigger, params: { vix_threshold: parseFloat(e.target.value) } },
                })}
              />
            </div>
          )}

          {trigger?.type === 'time_of_day' && (
            <div className="wf-trigger-params">
              <input
                type="number"
                min={0}
                max={23}
                placeholder="Hour"
                value={(trigger.params.hour as number) ?? ''}
                onChange={e => onTriggerConfigChange({
                  ...triggerConfig,
                  trigger: { ...trigger, params: { ...trigger.params, hour: parseInt(e.target.value) } },
                })}
              />
              <input
                type="number"
                min={0}
                max={59}
                placeholder="Minute"
                value={(trigger.params.minute as number) ?? ''}
                onChange={e => onTriggerConfigChange({
                  ...triggerConfig,
                  trigger: { ...trigger, params: { ...trigger.params, minute: parseInt(e.target.value) } },
                })}
              />
              <select
                value={(trigger.params.timezone as string) ?? 'US/Eastern'}
                onChange={e => onTriggerConfigChange({
                  ...triggerConfig,
                  trigger: { ...trigger, params: { ...trigger.params, timezone: e.target.value } },
                })}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
