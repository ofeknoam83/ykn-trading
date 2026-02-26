import type { ScanAlertConfig } from '../types/scanner.types';

interface AlertConfigPanelProps {
  config: ScanAlertConfig;
  onChange: (config: ScanAlertConfig) => void;
}

export function AlertConfigPanel({ config, onChange }: AlertConfigPanelProps) {
  const update = (patch: Partial<ScanAlertConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="sc-builder-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label className="sc-builder-section-title" style={{ margin: 0 }}>Alerts</label>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
        <span style={{ fontSize: 12, color: config.enabled ? '#3fb950' : '#8b949e' }}>
          {config.enabled ? 'On' : 'Off'}
        </span>
      </div>

      {config.enabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          <label style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={config.onNewMatch} onChange={(e) => update({ onNewMatch: e.target.checked })} />
            New matches
          </label>
          <label style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={config.onHighScore} onChange={(e) => update({ onHighScore: e.target.checked })} />
            High-score matches (&ge; {config.highScoreThreshold})
          </label>
          <label style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={config.onMatchLost} onChange={(e) => update({ onMatchLost: e.target.checked })} />
            Match removed
          </label>
          <label style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={config.onConvergence} onChange={(e) => update({ onConvergence: e.target.checked })} />
            Convergence alignment
          </label>

          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#8b949e' }}>Channels:</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {(['in_app', 'browser_push', 'email'] as const).map((ch) => (
                <label key={ch} style={{ fontSize: 11, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={config.channels.includes(ch)}
                    onChange={(e) => {
                      const channels = e.target.checked
                        ? [...config.channels, ch]
                        : config.channels.filter((c) => c !== ch);
                      update({ channels });
                    }}
                  />
                  {ch === 'in_app' ? 'In-app' : ch === 'browser_push' ? 'Push' : 'Email'}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#8b949e' }}>Max/hour:</span>
            <input
              type="number"
              value={config.maxAlertsPerHour}
              onChange={(e) => update({ maxAlertsPerHour: Number(e.target.value) })}
              min={1}
              max={100}
              style={{
                width: 50,
                padding: '2px 6px',
                fontSize: 12,
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: 4,
                color: '#e6edf3',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
