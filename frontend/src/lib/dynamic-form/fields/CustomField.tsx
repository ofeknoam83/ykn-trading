import type { FieldComponentProps } from '../types';

export function CustomField({ field }: FieldComponentProps) {
  const componentName = field.constraints?.componentName;

  return (
    <div className="df-custom-field">
      <p className="df-field-hint">
        Custom component &ldquo;{componentName ?? 'unknown'}&rdquo; not registered.
      </p>
    </div>
  );
}
