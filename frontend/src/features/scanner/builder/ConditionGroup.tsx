import { ConditionBuilder } from './ConditionBuilder';
import type { ScanConditionGroup } from '../types/scanner.types';

interface ConditionGroupProps {
  group: ScanConditionGroup;
  onChange: (group: ScanConditionGroup) => void;
  onRemove: () => void;
}

export function ConditionGroup({ group, onChange, onRemove }: ConditionGroupProps) {
  return (
    <div className="sc-condition-group">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#8b949e', textTransform: 'uppercase' }}>
            {group.operator} Group
          </span>
          <button
            className="sc-condition-operator-badge"
            onClick={() => onChange({ ...group, operator: group.operator === 'AND' ? 'OR' : 'AND' })}
          >
            {group.operator}
          </button>
        </div>
        <button className="sc-condition-remove" onClick={onRemove} title="Remove group">
          &times;
        </button>
      </div>
      <ConditionBuilder group={group} onChange={onChange} />
    </div>
  );
}
