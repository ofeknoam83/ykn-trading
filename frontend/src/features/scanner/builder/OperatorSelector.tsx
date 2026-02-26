import type { ConditionOperator } from '../types/scanner.types';

const ALL_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: '<', label: 'is below' },
  { value: '>', label: 'is above' },
  { value: '<=', label: 'is at or below' },
  { value: '>=', label: 'is at or above' },
  { value: '==', label: 'equals' },
  { value: 'crosses_above', label: 'crosses above' },
  { value: 'crosses_below', label: 'crosses below' },
  { value: 'between', label: 'is between' },
  { value: 'outside', label: 'is outside' },
];

interface OperatorSelectorProps {
  value: ConditionOperator;
  onChange: (op: ConditionOperator) => void;
  supportedOperators?: ConditionOperator[];
}

export function OperatorSelector({ value, onChange, supportedOperators }: OperatorSelectorProps) {
  const operators = supportedOperators
    ? ALL_OPERATORS.filter((op) => supportedOperators.includes(op.value))
    : ALL_OPERATORS;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ConditionOperator)}
    >
      {operators.map((op) => (
        <option key={op.value} value={op.value}>{op.label}</option>
      ))}
    </select>
  );
}
