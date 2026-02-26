import type { FieldSchema } from './types';
import { useDynamicForm } from './useDynamicForm';
import { groupFields } from './grouping';
import { FieldGroup } from './FieldGroup';
import { DynamicField } from './DynamicField';
import { getByPath } from './utils';

export interface DynamicFormProps {
  schema: FieldSchema[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  onChange?: (values: Record<string, unknown>) => void;
  submitLabel?: string;
  layout?: 'vertical' | 'two-column';
  disabled?: boolean;
  className?: string;
  hideSubmit?: boolean;
}

export function DynamicForm({
  schema,
  initialValues,
  onSubmit,
  onChange,
  submitLabel = 'Save',
  layout = 'vertical',
  disabled,
  className,
  hideSubmit,
}: DynamicFormProps) {
  const [state, actions] = useDynamicForm(schema, initialValues, onChange);

  if (schema.length === 0) {
    return (
      <div className="df-empty">
        No configuration required for this type.
      </div>
    );
  }

  const groups = groupFields(schema, state.values);
  const errorCount = Object.keys(state.errors).length;

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    actions.handleSubmit(onSubmit);
  }

  return (
    <form
      className={`df-form ${layout === 'two-column' ? 'df-two-column' : ''} ${className ?? ''}`}
      onSubmit={handleFormSubmit}
      noValidate
    >
      {errorCount > 0 && (
        <div className="df-error-summary">
          {errorCount} field{errorCount > 1 ? 's' : ''} need{errorCount === 1 ? 's' : ''} attention
        </div>
      )}

      {groups.map((group, gi) => (
        <FieldGroup
          key={group.name}
          name={group.name}
          collapsible={group.collapsible}
          defaultCollapsed={group.collapsible && gi > 0}
        >
          {group.fields.map(field => {
            if (!actions.isFieldVisible(field)) return null;
            return (
              <DynamicField
                key={field.key}
                field={field}
                value={getByPath(state.values, field.key)}
                error={state.errors[field.key]}
                onChange={(val) => actions.setValue(field.key, val)}
                onBlur={() => actions.touch(field.key)}
                disabled={disabled}
              />
            );
          })}
        </FieldGroup>
      ))}

      {!hideSubmit && (
        <div className="df-actions">
          <button
            type="submit"
            className="df-submit"
            disabled={disabled || state.isSubmitting}
          >
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
