import type { FieldComponentProps } from '../types';
import type { FieldSchema } from '../types';
import { getByPath } from '../utils';

// Lazy import to avoid circular dependency: DynamicField imports registry which imports ObjectField
// Instead, ObjectField receives a renderField prop via context or renders inline.
// For simplicity, we render inline using the same pattern.

export function ObjectField({ field, value, onChange, disabled }: FieldComponentProps) {
  const objValue = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const subFields = field.fields ?? [];

  function handleSubChange(subField: FieldSchema, subValue: unknown) {
    // subField.key might be a full path like "risk_thresholds.max_position_pct"
    // We need the relative key within this object
    const relativeKey = subField.key.split('.').pop()!;
    const updated = { ...objValue, [relativeKey]: subValue };
    onChange(updated);
  }

  if (subFields.length === 0) {
    return <p className="df-field-hint">No sub-fields defined</p>;
  }

  // ObjectField renders as a nested fieldset.
  // Individual sub-field rendering is handled by DynamicField at the form level,
  // since fields use dot-notation keys. This component is a fallback for explicit nesting.
  return (
    <fieldset className="df-object-fieldset">
      {field.label && <legend>{field.label}</legend>}
      <div className="df-object-fields">
        {subFields.map(sf => {
          const relKey = sf.key.split('.').pop()!;
          const subVal = getByPath(objValue, relKey);
          return (
            <div key={sf.key} className="df-field" data-field-key={sf.key}>
              {sf.type !== 'toggle' && sf.type !== 'checkbox' && (
                <label className="df-field-label" htmlFor={`df-${sf.key}`}>
                  {sf.icon && <span className="df-field-icon">{sf.icon}</span>}
                  {sf.label}
                  {sf.required && <span className="df-required">*</span>}
                </label>
              )}
              {/* Render a simple input based on type for nested objects */}
              {renderSimpleField(sf, subVal, v => handleSubChange(sf, v), disabled)}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Minimal field renderer for nested object sub-fields. */
function renderSimpleField(
  field: FieldSchema,
  value: unknown,
  onChange: (v: unknown) => void,
  disabled?: boolean,
) {
  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
        />
      );
    case 'number':
    case 'slider':
      return (
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={e => {
            const n = Number(e.target.value);
            onChange(isNaN(n) ? e.target.value : n);
          }}
          min={field.constraints?.min}
          max={field.constraints?.max}
          step={field.constraints?.step}
          disabled={disabled}
        />
      );
    case 'toggle':
    case 'checkbox':
      return (
        <label className="df-checkbox-field">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
            disabled={disabled}
          />
          <span>{field.label}</span>
        </label>
      );
    case 'select':
    case 'pill_group':
    case 'radio':
      return (
        <select
          value={String(value ?? '')}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
        >
          {(field.constraints?.options ?? []).map(o => (
            <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
          ))}
        </select>
      );
    default:
      return (
        <input
          type="text"
          value={String(value ?? '')}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
        />
      );
  }
}
