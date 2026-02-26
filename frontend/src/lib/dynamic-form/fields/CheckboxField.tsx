import type { FieldComponentProps } from '../types';

export function CheckboxField({ field, value, onChange, disabled }: FieldComponentProps) {
  const checked = !!value;

  return (
    <label className="df-checkbox-field" htmlFor={`df-${field.key}`}>
      <input
        type="checkbox"
        id={`df-${field.key}`}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled || field.readOnly}
      />
      <span>{field.label}</span>
    </label>
  );
}
