import type { FieldComponentProps } from '../types';

export function TextAreaField({ field, value, onChange, disabled }: FieldComponentProps) {
  return (
    <textarea
      id={`df-${field.key}`}
      value={(value as string) ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder}
      disabled={disabled || field.readOnly}
      rows={field.constraints?.minLines ?? 3}
      maxLength={field.constraints?.maxLength}
      autoComplete="off"
    />
  );
}
