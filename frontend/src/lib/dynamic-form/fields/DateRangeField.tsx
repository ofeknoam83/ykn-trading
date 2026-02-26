import type { FieldComponentProps } from '../types';
import { DateRangePicker, type DateRange } from '../../../components/pickers/DateRangePicker';

export function DateRangeField({ field, value, onChange, disabled }: FieldComponentProps) {
  const rangeValue: DateRange = (value && typeof value === 'object')
    ? (value as DateRange)
    : { start: '', end: '' };

  return (
    <DateRangePicker
      value={rangeValue}
      onChange={(range) => onChange(range)}
      disabled={disabled || field.readOnly}
    />
  );
}
