import { IndicatorSelector } from './IndicatorSelector';
import { OperatorSelector } from './OperatorSelector';
import { ValueInput } from './ValueInput';
import { TimeframeSelector } from './TimeframeSelector';
import type { ScanCondition, ConditionType, ConditionOperator, Timeframe } from '../types/scanner.types';
import { INDICATOR_CATALOG } from './IndicatorSelector';

interface ConditionRowProps {
  condition: ScanCondition;
  onChange: (condition: ScanCondition) => void;
  onRemove: () => void;
}

export function ConditionRow({ condition, onChange, onRemove }: ConditionRowProps) {
  const indicatorDef = INDICATOR_CATALOG.find((ind) => ind.id === condition.indicator);

  const handleIndicatorChange = (indicatorId: string) => {
    const def = INDICATOR_CATALOG.find((ind) => ind.id === indicatorId);
    if (def) {
      onChange({
        ...condition,
        indicator: def.id,
        type: def.type as ConditionType,
        params: { ...def.defaultParams },
        operator: def.supportedOperators[0] ?? '<',
      });
    }
  };

  const handleParamChange = (key: string, value: number) => {
    onChange({ ...condition, params: { ...condition.params, [key]: value } });
  };

  return (
    <div className="sc-condition-row">
      <IndicatorSelector
        value={condition.indicator}
        onChange={handleIndicatorChange}
      />

      {/* Inline params */}
      {Object.entries(condition.params).map(([key, val]) => (
        <input
          key={key}
          type="number"
          value={val}
          onChange={(e) => handleParamChange(key, Number(e.target.value))}
          title={indicatorDef?.paramLabels[key] ?? key}
          style={{ width: 50 }}
        />
      ))}

      <OperatorSelector
        value={condition.operator}
        onChange={(op: ConditionOperator) => onChange({ ...condition, operator: op })}
        supportedOperators={indicatorDef?.supportedOperators}
      />

      <ValueInput
        value={condition.value}
        dynamicRef={condition.dynamicRef}
        onChange={(value, dynamicRef) => onChange({ ...condition, value, dynamicRef })}
      />

      <TimeframeSelector
        value={condition.timeframe}
        onChange={(tf: Timeframe) => onChange({ ...condition, timeframe: tf })}
      />

      <button className="sc-condition-remove" onClick={onRemove} title="Remove condition">
        &times;
      </button>
    </div>
  );
}
