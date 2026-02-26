import { z } from 'zod';
import type { FieldSchema } from './types';
import { evaluateVisibility } from './visibility';

/**
 * Compiles an array of FieldSchemas into a Zod object schema.
 * Hidden fields (by visibility condition or hidden flag) are excluded.
 */
export function compileToZod(
  fields: FieldSchema[],
  formValues: Record<string, unknown>,
): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {};

  for (const field of fields) {
    if (!evaluateVisibility(field.showWhen, formValues)) continue;
    if (field.hidden) continue;

    const fieldZod = compileField(field, formValues);
    setNestedZod(shape, field.key, fieldZod);
  }

  return z.object(shape);
}

function compileField(
  field: FieldSchema,
  formValues: Record<string, unknown>,
): z.ZodType {
  let schema: z.ZodType;

  switch (field.type) {
    // Strings
    case 'text':
    case 'textarea':
    case 'code': {
      let s = z.string();
      if (field.constraints?.minLength) s = s.min(field.constraints.minLength);
      if (field.constraints?.maxLength) s = s.max(field.constraints.maxLength);
      if (field.constraints?.pattern) {
        s = s.regex(
          new RegExp(field.constraints.pattern),
          field.constraints.patternMessage ?? 'Invalid format',
        );
      }
      schema = s;
      break;
    }

    // Numbers
    case 'number':
    case 'slider': {
      let n = z.number();
      if (field.constraints?.min !== undefined) n = n.min(field.constraints.min);
      if (field.constraints?.max !== undefined) n = n.max(field.constraints.max);
      schema = n;
      break;
    }

    // Booleans
    case 'toggle':
    case 'checkbox':
      schema = z.boolean();
      break;

    // Single selection
    case 'select':
    case 'radio':
    case 'pill_group': {
      const options = field.constraints?.options;
      if (options && options.length > 0) {
        const values = options.map(o => o.value);
        if (values.every((v): v is string => typeof v === 'string')) {
          schema = z.enum(values as [string, ...string[]]);
        } else {
          const literals = values.map(v => z.literal(v));
          schema = z.union([literals[0], literals[1] ?? literals[0], ...literals.slice(2)] as unknown as [z.ZodType, z.ZodType, ...z.ZodType[]]);
        }
      } else {
        schema = z.unknown();
      }
      break;
    }

    // Multi selection
    case 'multi_select':
    case 'tags': {
      let arr = z.array(z.string());
      if (field.constraints?.minItems) arr = arr.min(field.constraints.minItems);
      if (field.constraints?.maxItems) arr = arr.max(field.constraints.maxItems);
      schema = arr;
      break;
    }

    // Domain pickers
    case 'asset_picker':
      schema = z.string().min(1);
      break;

    case 'asset_picker_multi':
      schema = z.array(z.string()).min(field.constraints?.minItems ?? 1);
      break;

    case 'date_range':
      schema = z.object({
        start: z.string().min(1),
        end: z.string().min(1),
      });
      break;

    case 'interval':
      schema = z.string();
      break;

    case 'benchmark':
      schema = z.string();
      break;

    case 'option_chain':
      schema = z.array(z.object({
        symbol: z.string(),
        expiry: z.string(),
        strike: z.number(),
        type: z.enum(['call', 'put']),
        action: z.enum(['buy', 'sell']),
        quantity: z.number().int().min(1),
      }));
      break;

    // Composite
    case 'object': {
      if (field.fields) {
        schema = compileToZod(field.fields, formValues);
      } else {
        schema = z.record(z.string(), z.unknown());
      }
      break;
    }

    case 'array': {
      if (field.itemSchema) {
        let arr = z.array(compileField(field.itemSchema, formValues));
        if (field.constraints?.minItems) arr = arr.min(field.constraints.minItems);
        if (field.constraints?.maxItems) arr = arr.max(field.constraints.maxItems);
        schema = arr;
      } else {
        schema = z.array(z.unknown());
      }
      break;
    }

    case 'key_value':
      schema = z.array(z.object({
        key: z.string().min(1),
        value: z.string(),
      }));
      break;

    case 'custom':
      schema = z.unknown();
      break;

    default:
      schema = z.unknown();
  }

  // Apply required/optional
  if (!field.required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Sets a value at a dot-notation path in a nested Zod shape.
 * "risk_thresholds.max_position_pct" → shape.risk_thresholds = z.object({ max_position_pct: ... })
 */
function setNestedZod(
  shape: Record<string, z.ZodType>,
  path: string,
  value: z.ZodType,
): void {
  const parts = path.split('.');
  if (parts.length === 1) {
    shape[parts[0]] = value;
    return;
  }

  const [head, ...rest] = parts;
  if (!shape[head]) {
    shape[head] = z.object({});
  }

  // Try to access the inner shape if it's an object schema
  const existing = shape[head];
  try {
    const existingShape = (existing as z.ZodObject<Record<string, z.ZodType>>).shape;
    const innerShape: Record<string, z.ZodType> = { ...existingShape };
    setNestedZod(innerShape, rest.join('.'), value);
    shape[head] = z.object(innerShape);
  } catch {
    // If the existing schema is not a ZodObject, create a new one
    const innerShape: Record<string, z.ZodType> = {};
    setNestedZod(innerShape, rest.join('.'), value);
    shape[head] = z.object(innerShape);
  }
}
