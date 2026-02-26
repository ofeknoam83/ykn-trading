import type { FieldComponentProps } from '../types';

export function TextField({ field, value, onChange, disabled }: FieldComponentProps) {
  return (
    <input
      type="text"
      id={`df-${field.key}`}
      value={(value as string) ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder}
      disabled={disabled || field.readOnly}
      maxLength={field.constraints?.maxLength}
      autoComplete="off"
    />
  );
}
