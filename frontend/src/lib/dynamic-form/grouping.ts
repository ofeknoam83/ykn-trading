import type { FieldSchema } from './types';
import { evaluateVisibility } from './visibility';

export interface FieldGroupDef {
  name: string;
  order: number;
  collapsible: boolean;
  fields: FieldSchema[];
}

const COLLAPSIBLE_KEYWORDS = ['advanced', 'hyperparameters', 'optional', 'regularization'];

/**
 * Groups visible fields by their `group` property,
 * sorts groups by `groupOrder`, and fields within by `order`.
 */
export function groupFields(
  schema: FieldSchema[],
  formValues: Record<string, unknown>,
): FieldGroupDef[] {
  // Filter to visible fields only
  const visible = schema.filter(
    f => !f.hidden && evaluateVisibility(f.showWhen, formValues),
  );

  // Group by group name
  const grouped = new Map<string, FieldSchema[]>();
  for (const field of visible) {
    const name = field.group ?? '_default';
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name)!.push(field);
  }

  // Sort fields within each group by order, build result
  const result: FieldGroupDef[] = [];
  for (const [name, fields] of grouped) {
    fields.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    result.push({
      name,
      order: fields[0]?.groupOrder ?? 999,
      collapsible: COLLAPSIBLE_KEYWORDS.some(k =>
        name.toLowerCase().includes(k),
      ),
      fields,
    });
  }

  // Sort groups by order
  result.sort((a, b) => a.order - b.order);
  return result;
}
