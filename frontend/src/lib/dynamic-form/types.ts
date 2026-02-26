/**
 * FieldSchema is the intermediate representation for a single form field.
 * An array of FieldSchema defines a complete form.
 * This is the ONLY type the renderer and validator consume.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'slider'
  | 'toggle'
  | 'checkbox'
  | 'select'
  | 'multi_select'
  | 'radio'
  | 'pill_group'
  | 'asset_picker'
  | 'asset_picker_multi'
  | 'date_range'
  | 'interval'
  | 'benchmark'
  | 'option_chain'
  | 'tags'
  | 'key_value'
  | 'code'
  | 'object'
  | 'array'
  | 'custom';

export interface SelectOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface FieldConstraints {
  // Numeric
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  unitPosition?: 'prefix' | 'suffix';

  // String
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;

  // Select/Radio/Pill
  options?: SelectOption[];

  // Multi-select / Tags
  minItems?: number;
  maxItems?: number;

  // Asset picker
  assetClasses?: string[];
  exchanges?: string[];

  // Code
  language?: string;
  minLines?: number;
  maxLines?: number;

  // Custom component
  componentName?: string;
  componentProps?: Record<string, unknown>;
}

export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'is_empty'
  | 'is_not_empty'
  | 'is_truthy'
  | 'is_falsy';

export interface SingleCondition {
  field: string;
  operator: ConditionOperator;
  value?: unknown;
}

export type VisibilityCondition =
  | SingleCondition
  | { and: VisibilityCondition[] }
  | { or: VisibilityCondition[] };

export interface FieldSchema {
  // Identity
  key: string;
  type: FieldType;

  // Display
  label: string;
  description?: string;
  placeholder?: string;
  group?: string;
  groupOrder?: number;
  order?: number;
  icon?: string;

  // Value
  defaultValue?: unknown;
  required?: boolean;
  readOnly?: boolean;
  hidden?: boolean;

  // Constraints
  constraints?: FieldConstraints;

  // Conditional Visibility
  showWhen?: VisibilityCondition;

  // Nested / Complex
  fields?: FieldSchema[];
  itemSchema?: FieldSchema;
}

/** Props interface shared by all field components in the registry. */
export interface FieldComponentProps {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

/** Override type for build-time schema generation. */
export type FieldOverrides = Record<string, Partial<FieldSchema>>;
