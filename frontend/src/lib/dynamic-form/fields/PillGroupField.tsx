import type { FieldComponentProps } from '../types';

export function PillGroupField({ field, value, onChange, disabled }: FieldComponentProps) {
  const options = field.constraints?.options ?? [];

  return (
    <div className="df-pill-group" role="radiogroup" aria-label={field.label}>
      {options.map(opt => (
        <button
          key={String(opt.value)}
          type="button"
          className={`df-pill ${value === opt.value ? 'df-pill-active' : ''} ${opt.disabled ? 'df-pill-disabled' : ''}`}
          onClick={() => {
            if (!disabled && !field.readOnly && !opt.disabled) {
              onChange(opt.value);
            }
          }}
          disabled={disabled || field.readOnly || opt.disabled}
          title={opt.description ?? opt.disabledReason}
          aria-pressed={value === opt.value}
        >
          {opt.icon && <span className="df-pill-icon">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
