import type { FieldComponentProps } from '../types';

export function ToggleField({ field, value, onChange, disabled }: FieldComponentProps) {
  const checked = !!value;

  return (
    <label className="df-toggle-field" htmlFor={`df-${field.key}`}>
      <div
        className={`df-toggle-track ${checked ? 'df-toggle-on' : ''}`}
        onClick={() => {
          if (!disabled && !field.readOnly) onChange(!checked);
        }}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!disabled && !field.readOnly) onChange(!checked);
          }
        }}
      >
        <div className="df-toggle-thumb" />
      </div>
      <input
        type="checkbox"
        id={`df-${field.key}`}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled || field.readOnly}
        className="df-sr-only"
        tabIndex={-1}
      />
      <span className="df-toggle-label">{field.label}</span>
    </label>
  );
}
