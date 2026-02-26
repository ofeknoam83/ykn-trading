import type { ConvergenceRule, ScanCondition, Timeframe } from '../types/scanner.types';
import { ConditionRow } from './ConditionRow';
import { generateId } from '../utils/conditionSerializer';

interface ConvergenceBuilderProps {
  rules: ConvergenceRule[];
  onChange: (rules: ConvergenceRule[]) => void;
}

const TIMEFRAME_OPTIONS: { value: Timeframe; label: string }[] = [
  { value: '1d', label: 'Daily' },
  { value: '1w', label: 'Weekly' },
  { value: '1M', label: 'Monthly' },
];

export function ConvergenceBuilder({ rules, onChange }: ConvergenceBuilderProps) {
  const addRule = () => {
    const usedTFs = new Set(rules.map((r) => r.timeframe));
    const nextTF = TIMEFRAME_OPTIONS.find((tf) => !usedTFs.has(tf.value))?.value ?? '1d';
    onChange([
      ...rules,
      {
        id: generateId(),
        timeframe: nextTF,
        conditions: [],
        weight: 1,
        required: true,
      },
    ]);
  };

  const updateRule = (idx: number, updated: Partial<ConvergenceRule>) => {
    const newRules = [...rules];
    newRules[idx] = { ...newRules[idx], ...updated };
    onChange(newRules);
  };

  const removeRule = (idx: number) => {
    onChange(rules.filter((_, i) => i !== idx));
  };

  const addConditionToRule = (idx: number) => {
    const newCondition: ScanCondition = {
      id: generateId(),
      type: 'technical',
      indicator: 'RSI',
      params: { period: 14 },
      operator: '<',
      value: 30,
      timeframe: rules[idx].timeframe,
    };
    const newRules = [...rules];
    newRules[idx] = { ...newRules[idx], conditions: [...newRules[idx].conditions, newCondition] };
    onChange(newRules);
  };

  const updateConditionInRule = (ruleIdx: number, condIdx: number, cond: ScanCondition) => {
    const newRules = [...rules];
    const newConds = [...newRules[ruleIdx].conditions];
    newConds[condIdx] = cond;
    newRules[ruleIdx] = { ...newRules[ruleIdx], conditions: newConds };
    onChange(newRules);
  };

  const removeConditionFromRule = (ruleIdx: number, condIdx: number) => {
    const newRules = [...rules];
    newRules[ruleIdx] = {
      ...newRules[ruleIdx],
      conditions: newRules[ruleIdx].conditions.filter((_, i) => i !== condIdx),
    };
    onChange(newRules);
  };

  return (
    <div className="sc-convergence">
      {rules.map((rule, ruleIdx) => (
        <div key={rule.id} className="sc-convergence-rule">
          <div className="sc-convergence-rule-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select
                value={rule.timeframe}
                onChange={(e) => updateRule(ruleIdx, { timeframe: e.target.value as Timeframe })}
                style={{ padding: '2px 6px', fontSize: 12, background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3' }}
              >
                {TIMEFRAME_OPTIONS.map((tf) => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
              <label style={{ fontSize: 11, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="checkbox"
                  checked={rule.required}
                  onChange={(e) => updateRule(ruleIdx, { required: e.target.checked })}
                />
                Required
              </label>
              {rule.required && <span className="sc-convergence-required">Required</span>}
            </div>
            <button className="sc-condition-remove" onClick={() => removeRule(ruleIdx)}>
              &times;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {rule.conditions.map((cond, condIdx) => (
              <ConditionRow
                key={cond.id}
                condition={cond}
                onChange={(updated) => updateConditionInRule(ruleIdx, condIdx, updated)}
                onRemove={() => removeConditionFromRule(ruleIdx, condIdx)}
              />
            ))}
          </div>

          <button
            className="sc-add-condition"
            onClick={() => addConditionToRule(ruleIdx)}
            style={{ marginTop: 6 }}
          >
            + Add Condition
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 11, color: '#8b949e' }}>Weight:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={rule.weight}
              onChange={(e) => updateRule(ruleIdx, { weight: Number(e.target.value) })}
              style={{ width: 80, accentColor: '#58a6ff' }}
            />
            <span style={{ fontSize: 11, color: '#e6edf3' }}>{rule.weight.toFixed(1)}</span>
          </div>
        </div>
      ))}

      {rules.length < 3 && (
        <button className="sc-add-condition" onClick={addRule}>
          + Add Timeframe
        </button>
      )}
    </div>
  );
}
