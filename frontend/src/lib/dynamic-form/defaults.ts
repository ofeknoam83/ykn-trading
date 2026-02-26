import type { FieldSchema } from './types';
import { getByPath, setByPath } from './utils';

/**
 * Computes default values for a form by merging:
 * 1. initialValues (highest priority — editing existing entity)
 * 2. field.defaultValue (schema-defined defaults)
 * 3. Type-inferred defaults (fallback)
 */
export function computeDefaults(
  schema: FieldSchema[],
  initialValues?: Record<string, unknown>,
): Record<string, unknown> {
  let defaults: Record<string, unknown> = {};

  for (const field of schema) {
    const initial = initialValues ? getByPath(initialValues, field.key) : undefined;

    if (initial !== undefined) {
      defaults = setByPath(defaults, field.key, initial);
    } else if (field.defaultValue !== undefined) {
      defaults = setByPath(defaults, field.key, structuredClone(field.defaultValue));
    } else {
      defaults = setByPath(defaults, field.key, inferDefault(field));
    }
  }

  return defaults;
}

export function inferDefault(field: FieldSchema): unknown {
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'code':
      return '';
    case 'number':
    case 'slider':
      return field.constraints?.min ?? 0;
    case 'toggle':
    case 'checkbox':
      return false;
    case 'select':
    case 'radio':
    case 'pill_group':
      return field.constraints?.options?.[0]?.value ?? '';
    case 'multi_select':
    case 'tags':
    case 'asset_picker_multi':
      return [];
    case 'asset_picker':
      return '';
    case 'date_range':
      return { start: '', end: '' };
    case 'interval':
      return '1d';
    case 'benchmark':
      return '';
    case 'option_chain':
      return [];
    case 'key_value':
      return [];
    case 'object':
      return field.fields ? computeDefaults(field.fields) : {};
    case 'array':
      if (field.constraints?.minItems && field.itemSchema) {
        return Array.from(
          { length: field.constraints.minItems },
          () => inferDefault(field.itemSchema!),
        );
      }
      return [];
    default:
      return null;
  }
}
