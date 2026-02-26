import { useMemo } from 'react';
import type { OptimizationParameter } from '../../../types/backtest';
import { OPTIMIZATION_METRICS } from '../../../types/backtest';

interface WalkForwardConfigProps {
  windowType: 'rolling' | 'expanding';
  onWindowTypeChange: (t: 'rolling' | 'expanding') => void;
  isSampleDays: number;
  onIsSampleDaysChange: (d: number) => void;
  oosSampleDays: number;
  onOosSampleDaysChange: (d: number) => void;
  stepDays: number;
  onStepDaysChange: (d: number) => void;
  reOptimize: boolean;
  onReOptimizeChange: (r: boolean) => void;
  optTarget: string;
  onOptTargetChange: (t: string) => void;
  optParams: OptimizationParameter[];
  onOptParamsChange: (p: OptimizationParameter[]) => void;
}

export function WalkForwardConfig({
  windowType,
  onWindowTypeChange,
  isSampleDays,
  onIsSampleDaysChange,
  oosSampleDays,
  onOosSampleDaysChange,
  stepDays,
  onStepDaysChange,
  reOptimize,
  onReOptimizeChange,
  optTarget,
  onOptTargetChange,
}: WalkForwardConfigProps) {
  const windowCount = useMemo(() => {
    // Approximate: total days from default 1Y range
    const totalDays = 756; // ~3 years
    const totalNeeded = isSampleDays + oosSampleDays;
    if (totalNeeded > totalDays) return 0;
    return Math.floor((totalDays - isSampleDays) / stepDays);
  }, [isSampleDays, oosSampleDays, stepDays]);

  return (
    <div className="bt-wf-config">
      <h4 className="bt-config-section-title">Walk-Forward</h4>

      <div className="bt-config-section">
        <label className="bt-config-label">Window Type</label>
        <div className="bt-radio-row">
          <label className="bt-radio-label">
            <input
              type="radio"
              checked={windowType === 'rolling'}
              onChange={() => onWindowTypeChange('rolling')}
            />
            Rolling
          </label>
          <label className="bt-radio-label">
            <input
              type="radio"
              checked={windowType === 'expanding'}
              onChange={() => onWindowTypeChange('expanding')}
            />
            Expanding
          </label>
        </div>
      </div>

      <div className="bt-config-section">
        <label className="bt-config-label">In-Sample (trading days)</label>
        <input
          type="number"
          className="bt-input bt-input-sm"
          value={isSampleDays}
          min={20}
          onChange={(e) => onIsSampleDaysChange(Number(e.target.value) || 252)}
        />
        <span className="bt-hint">~{Math.round(isSampleDays / 252)} year(s)</span>
      </div>

      <div className="bt-config-section">
        <label className="bt-config-label">Out-of-Sample (trading days)</label>
        <input
          type="number"
          className="bt-input bt-input-sm"
          value={oosSampleDays}
          min={5}
          onChange={(e) => onOosSampleDaysChange(Number(e.target.value) || 63)}
        />
        <span className="bt-hint">~{Math.round(oosSampleDays / 21)} month(s)</span>
      </div>

      <div className="bt-config-section">
        <label className="bt-config-label">Step Size (trading days)</label>
        <input
          type="number"
          className="bt-input bt-input-sm"
          value={stepDays}
          min={5}
          onChange={(e) => onStepDaysChange(Number(e.target.value) || 63)}
        />
      </div>

      {/* Visual timeline */}
      <div className="bt-wf-timeline">
        <div className="bt-wf-timeline-info">
          Windows: <strong>{windowCount}</strong> | OOS coverage: <strong>{windowCount * oosSampleDays}</strong> days
        </div>
        <div className="bt-wf-timeline-bars">
          {Array.from({ length: Math.min(windowCount, 6) }).map((_, i) => (
            <div key={i} className="bt-wf-window-bar" style={{ marginLeft: `${i * 12}%` }}>
              <div className="bt-wf-is-bar" style={{ width: `${Math.min(60, isSampleDays / 5)}px` }} title="In-Sample" />
              <div className="bt-wf-oos-bar" style={{ width: `${Math.min(30, oosSampleDays / 3)}px` }} title="Out-of-Sample" />
            </div>
          ))}
        </div>
        {windowCount < 3 && windowCount > 0 && (
          <p className="bt-warning-text">
            Only {windowCount} windows. Walk-forward is more reliable with 5+.
          </p>
        )}
      </div>

      <div className="bt-config-section">
        <label className="bt-checkbox-label">
          <input
            type="checkbox"
            checked={reOptimize}
            onChange={(e) => onReOptimizeChange(e.target.checked)}
          />
          Re-optimize per window
        </label>
      </div>

      {reOptimize && (
        <div className="bt-config-section">
          <label className="bt-config-label">Optimization Target</label>
          <select
            className="bt-select"
            value={optTarget}
            onChange={(e) => onOptTargetChange(e.target.value)}
          >
            {OPTIMIZATION_METRICS.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
