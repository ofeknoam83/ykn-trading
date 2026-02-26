import type { FieldComponentProps } from '../types';
import { IntervalPicker } from '../../../components/pickers/IntervalPicker';

export function IntervalField({ field, value, onChange, disabled }: FieldComponentProps) {
  return (
    <IntervalPicker
      value={(value as string) ?? '1d'}
      onChange={(v) => onChange(v)}
      disabled={disabled || field.readOnly}
    />
  );
}
