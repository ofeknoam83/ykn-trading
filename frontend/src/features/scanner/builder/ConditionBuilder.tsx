import { ConditionRow } from './ConditionRow';
import { ConditionGroup } from './ConditionGroup';
import { generateId } from '../utils/conditionSerializer';
import type { ScanConditionGroup, ScanCondition } from '../types/scanner.types';

interface ConditionBuilderProps {
  group: ScanConditionGroup;
  onChange: (group: ScanConditionGroup) => void;
}

export function ConditionBuilder({ group, onChange }: ConditionBuilderProps) {
  const addCondition = () => {
    const newCondition: ScanCondition = {
      id: generateId(),
      type: 'technical',
      indicator: 'RSI',
      params: { period: 14 },
      operator: '<',
      value: 30,
      timeframe: '1d',
    };
    onChange({
      ...group,
      conditions: [...group.conditions, newCondition],
    });
  };

  const addGroup = () => {
    const newGroup: ScanConditionGroup = {
      id: generateId(),
      operator: 'OR',
      conditions: [],
    };
    onChange({
      ...group,
      conditions: [...group.conditions, newGroup],
    });
  };

  const updateCondition = (idx: number, updated: ScanCondition | ScanConditionGroup) => {
    const newConditions = [...group.conditions];
    newConditions[idx] = updated;
    onChange({ ...group, conditions: newConditions });
  };

  const removeCondition = (idx: number) => {
    const newConditions = group.conditions.filter((_, i) => i !== idx);
    onChange({ ...group, conditions: newConditions });
  };

  const toggleOperator = () => {
    onChange({ ...group, operator: group.operator === 'AND' ? 'OR' : 'AND' });
  };

  return (
    <div className="sc-conditions">
      {group.conditions.map((item, idx) => {
        const isGroup = 'conditions' in item && Array.isArray((item as ScanConditionGroup).conditions);

        return (
          <div key={item.id}>
            {idx > 0 && (
              <button className="sc-condition-operator-badge" onClick={toggleOperator}>
                {group.operator}
              </button>
            )}
            {isGroup ? (
              <ConditionGroup
                group={item as ScanConditionGroup}
                onChange={(updated) => updateCondition(idx, updated)}
                onRemove={() => removeCondition(idx)}
              />
            ) : (
              <ConditionRow
                condition={item as ScanCondition}
                onChange={(updated) => updateCondition(idx, updated)}
                onRemove={() => removeCondition(idx)}
              />
            )}
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="sc-add-condition" onClick={addCondition}>
          + Add Condition
        </button>
        <button className="sc-add-condition" onClick={addGroup}>
          + Add Group
        </button>
      </div>
    </div>
  );
}
