/**
 * Minimal get/set by dot-notation path.
 * Replaces lodash-es get/set to avoid adding a dependency.
 */

export function getByPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const result = { ...obj };
  const parts = path.split('.');

  if (parts.length === 1) {
    result[parts[0]] = value;
    return result;
  }

  const [head, ...rest] = parts;
  const nested = (result[head] && typeof result[head] === 'object')
    ? { ...(result[head] as Record<string, unknown>) }
    : {};
  result[head] = setByPath(nested, rest.join('.'), value);
  return result;
}
