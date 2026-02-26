import type { FieldComponentProps } from '../types';

export function RadioField({ field, value, onChange, disabled }: FieldComponentProps) {
  const options = field.constraints?.options ?? [];

  return (
    <div className="df-radio-group" role="radiogroup" aria-label={field.label}>
      {options.map(opt => (
        <label
          key={String(opt.value)}
          className={`df-radio-option ${opt.disabled ? 'df-option-disabled' : ''}`}
        >
          <input
            type="radio"
            name={`df-${field.key}`}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            disabled={disabled || field.readOnly || opt.disabled}
          />
          {opt.icon && <span className="df-option-icon">{opt.icon}</span>}
          <span className="df-option-label">{opt.label}</span>
          {opt.description && (
            <span className="df-option-desc">{opt.description}</span>
          )}
        </label>
      ))}
    </div>
  );
}
