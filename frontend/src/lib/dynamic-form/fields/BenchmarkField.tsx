import type { FieldComponentProps } from '../types';
import { BenchmarkPicker } from '../../../components/pickers/BenchmarkPicker';

export function BenchmarkField({ field, value, onChange, disabled }: FieldComponentProps) {
  return (
    <BenchmarkPicker
      value={(value as string) ?? ''}
      onChange={(v) => onChange(v)}
      placeholder={field.placeholder ?? 'Select benchmark'}
      disabled={disabled || field.readOnly}
    />
  );
}
