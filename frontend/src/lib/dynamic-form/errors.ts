import type { z } from 'zod';

/**
 * Converts Zod errors to a flat Record<fieldPath, message> map.
 */
export function mapZodErrors(zodError: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of zodError.issues) {
    const path = issue.path.join('.');
    if (path && !errors[path]) {
      errors[path] = humanizeZodMessage(issue);
    }
  }
  return errors;
}

function humanizeZodMessage(issue: z.ZodIssue): string {
  // Zod v4 issue codes differ from v3.
  // Use a generic approach that works across versions.
  const code = issue.code as string;
  const i = issue as unknown as Record<string, unknown>;

  if (code === 'too_small') {
    if (i.type === 'string') return `Must be at least ${i.minimum} characters`;
    if (i.type === 'number') return `Must be at least ${i.minimum}`;
    if (i.type === 'array') return `Select at least ${i.minimum} item${(Number(i.minimum) ?? 0) > 1 ? 's' : ''}`;
  }

  if (code === 'too_big') {
    if (i.type === 'string') return `Must be at most ${i.maximum} characters`;
    if (i.type === 'number') return `Must be at most ${i.maximum}`;
    if (i.type === 'array') return `Maximum ${i.maximum} items`;
  }

  return issue.message;
}

/**
 * Maps FastAPI 422 validation errors to field error records.
 * Strips the prefix (e.g., "body", "config") from the location path.
 */
export function mapServerErrors(
  errors: Array<{ loc: string[]; msg: string }>,
  pathPrefix: string = 'config',
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const err of errors) {
    const idx = err.loc.indexOf(pathPrefix);
    const fieldPath = err.loc.slice(idx + 1).join('.');
    if (fieldPath) {
      result[fieldPath] = err.msg;
    }
  }
  return result;
}
