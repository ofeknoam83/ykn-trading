// Public API for the Dynamic Form Engine

// Core component
export { DynamicForm } from './DynamicForm';
export type { DynamicFormProps } from './DynamicForm';

// Types
export type {
  FieldSchema,
  FieldType,
  FieldConstraints,
  FieldComponentProps,
  SelectOption,
  VisibilityCondition,
  SingleCondition,
  ConditionOperator,
  FieldOverrides,
} from './types';

// Sub-components
export { DynamicField } from './DynamicField';
export { FieldGroup } from './FieldGroup';

// Core logic
export { evaluateVisibility, extractDependencyFields } from './visibility';
export { compileToZod } from './schemaToZod';
export { computeDefaults, inferDefault } from './defaults';
export { mapZodErrors, mapServerErrors } from './errors';
export { groupFields } from './grouping';
export type { FieldGroupDef } from './grouping';

// Hooks
export { useDynamicForm } from './useDynamicForm';
export type { DynamicFormState, DynamicFormActions } from './useDynamicForm';

// Registry
export { FIELD_COMPONENT_REGISTRY, registerFieldComponent } from './fieldComponentRegistry';

// Utilities
export { getByPath, setByPath } from './utils';

// Import CSS side-effect
import './DynamicForm.css';
