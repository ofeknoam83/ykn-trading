import type { FieldSchema } from './types';
import { FIELD_COMPONENT_REGISTRY } from './fieldComponentRegistry';

interface DynamicFieldProps {
  field: FieldSchema;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function DynamicField({ field, value, error, onChange, onBlur, disabled }: DynamicFieldProps) {
  const FieldComponent = FIELD_COMPONENT_REGISTRY[field.type];

  if (!FieldComponent) {
    if (import.meta.env.DEV) {
      console.warn(`No component registered for field type: ${field.type}`);
    }
    return null;
  }

  // Toggle and checkbox render their own label inline
  const showLabel = field.type !== 'toggle' && field.type !== 'checkbox';

  return (
    <div
      className={`df-field ${error ? 'df-field-error' : ''}`}
      data-field-key={field.key}
      onBlur={onBlur}
    >
      {showLabel && (
        <label className="df-field-label" htmlFor={`df-${field.key}`}>
          {field.icon && <span className="df-field-icon">{field.icon}</span>}
          {field.label}
          {field.required && <span className="df-required">*</span>}
          {field.description && (
            <span className="df-field-desc" title={field.description}>
              ?
            </span>
          )}
        </label>
      )}

      <FieldComponent
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled || field.readOnly}
      />

      {error && (
        <p className="df-error" role="alert">{error}</p>
      )}

      {field.description && (field.type === 'slider' || field.type === 'code') && (
        <p className="df-field-hint">{field.description}</p>
      )}
    </div>
  );
}
