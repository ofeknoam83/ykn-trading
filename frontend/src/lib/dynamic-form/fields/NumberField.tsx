import type { FieldComponentProps } from '../types';

export function NumberField({ field, value, onChange, disabled }: FieldComponentProps) {
  const c = field.constraints;
  const numValue = typeof value === 'number' ? value : (value === '' ? '' : Number(value));
  const step = c?.step ?? 1;
  const unit = c?.unit;
  const isPrefix = c?.unitPosition === 'prefix';

  function handleChange(raw: string) {
    if (raw === '' || raw === '-') {
      onChange(raw);
      return;
    }
    const n = Number(raw);
    if (!isNaN(n)) onChange(n);
  }

  function increment() {
    const n = typeof numValue === 'number' ? numValue : 0;
    const next = n + step;
    if (c?.max !== undefined && next > c.max) return;
    onChange(next);
  }

  function decrement() {
    const n = typeof numValue === 'number' ? numValue : 0;
    const next = n - step;
    if (c?.min !== undefined && next < c.min) return;
    onChange(next);
  }

  return (
    <div className="df-number-field">
      <button
        type="button"
        className="df-number-step"
        onClick={decrement}
        disabled={disabled || field.readOnly}
        tabIndex={-1}
        aria-label="Decrease"
      >
        -
      </button>
      {isPrefix && unit && <span className="df-number-unit">{unit}</span>}
      <input
        type="number"
        id={`df-${field.key}`}
        value={numValue}
        onChange={e => handleChange(e.target.value)}
        min={c?.min}
        max={c?.max}
        step={step}
        placeholder={field.placeholder}
        disabled={disabled || field.readOnly}
        autoComplete="off"
      />
      {!isPrefix && unit && <span className="df-number-unit">{unit}</span>}
      <button
        type="button"
        className="df-number-step"
        onClick={increment}
        disabled={disabled || field.readOnly}
        tabIndex={-1}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
