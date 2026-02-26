import type { VisibilityCondition, ConditionOperator, FieldSchema } from './types';
import { getByPath } from './utils';

/**
 * Evaluates whether a field should be visible given current form values.
 */
export function evaluateVisibility(
  condition: VisibilityCondition | undefined,
  formValues: Record<string, unknown>,
): boolean {
  if (!condition) return true;

  if ('and' in condition) {
    return condition.and.every(c => evaluateVisibility(c, formValues));
  }

  if ('or' in condition) {
    return condition.or.some(c => evaluateVisibility(c, formValues));
  }

  // SingleCondition
  const fieldValue = getByPath(formValues, condition.field);
  return evaluateOperator(fieldValue, condition.operator, condition.value);
}

function evaluateOperator(
  fieldValue: unknown,
  operator: ConditionOperator,
  compareValue: unknown,
): boolean {
  switch (operator) {
    case 'eq':
      return fieldValue === compareValue;
    case 'neq':
      return fieldValue !== compareValue;
    case 'gt':
      return typeof fieldValue === 'number' && fieldValue > (compareValue as number);
    case 'gte':
      return typeof fieldValue === 'number' && fieldValue >= (compareValue as number);
    case 'lt':
      return typeof fieldValue === 'number' && fieldValue < (compareValue as number);
    case 'lte':
      return typeof fieldValue === 'number' && fieldValue <= (compareValue as number);
    case 'in':
      return Array.isArray(compareValue) && compareValue.includes(fieldValue);
    case 'not_in':
      return Array.isArray(compareValue) && !compareValue.includes(fieldValue);
    case 'contains':
      if (typeof fieldValue === 'string') return fieldValue.includes(compareValue as string);
      if (Array.isArray(fieldValue)) return fieldValue.includes(compareValue);
      return false;
    case 'is_empty':
      return (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );
    case 'is_not_empty':
      return !(
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );
    case 'is_truthy':
      return !!fieldValue;
    case 'is_falsy':
      return !fieldValue;
    default:
      return true;
  }
}

/**
 * Extracts all field keys that are referenced in visibility conditions.
 * Used for memoizing Zod schema recompilation.
 */
export function extractDependencyFields(fields: FieldSchema[]): string[] {
  const deps = new Set<string>();

  function walkCondition(condition: VisibilityCondition | undefined) {
    if (!condition) return;
    if ('and' in condition) {
      condition.and.forEach(walkCondition);
      return;
    }
    if ('or' in condition) {
      condition.or.forEach(walkCondition);
      return;
    }
    deps.add(condition.field);
  }

  function walkFields(list: FieldSchema[]) {
    for (const f of list) {
      walkCondition(f.showWhen);
      if (f.fields) walkFields(f.fields);
    }
  }

  walkFields(fields);
  return Array.from(deps);
}
