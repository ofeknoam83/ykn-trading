import type { ScanCondition, ScanConditionGroup, ConditionOperator } from '../types/scanner.types';

/**
 * Client-side condition evaluation for previews and local filtering.
 * The actual scan engine runs server-side; this is for UI responsiveness.
 */

export function evaluateOperator(actual: number, operator: ConditionOperator, threshold: number, threshold2?: number): boolean {
  switch (operator) {
    case '<': return actual < threshold;
    case '>': return actual > threshold;
    case '<=': return actual <= threshold;
    case '>=': return actual >= threshold;
    case '==': return Math.abs(actual - threshold) < 0.0001;
    case 'between': return threshold2 !== undefined && actual >= threshold && actual <= threshold2;
    case 'outside': return threshold2 !== undefined && (actual < threshold || actual > threshold2);
    case 'crosses_above':
    case 'crosses_below':
      // Cross detection requires previous bar state - not available client-side
      return false;
    default:
      return false;
  }
}

export function evaluateConditionGroup(
  group: ScanConditionGroup,
  getIndicatorValue: (condition: ScanCondition) => number | null,
): boolean {
  const results = group.conditions.map((item) => {
    if ('operator' in item && 'conditions' in item && Array.isArray((item as ScanConditionGroup).conditions)) {
      return evaluateConditionGroup(item as ScanConditionGroup, getIndicatorValue);
    }
    const condition = item as ScanCondition;
    const actual = getIndicatorValue(condition);
    if (actual === null) return false;
    const threshold = typeof condition.value === 'number' ? condition.value : 0;
    return evaluateOperator(actual, condition.operator, threshold);
  });

  if (group.operator === 'AND') {
    return results.every(Boolean);
  }
  return results.some(Boolean);
}

export function computeSignalStrength(actual: number, operator: ConditionOperator, threshold: number, strongRange: number): number {
  if (strongRange <= 0) return 50;

  let distance: number;
  switch (operator) {
    case '<':
    case '<=':
      distance = threshold - actual;
      break;
    case '>':
    case '>=':
      distance = actual - threshold;
      break;
    case '==':
      distance = strongRange - Math.abs(actual - threshold);
      break;
    default:
      distance = Math.abs(actual - threshold);
  }

  if (distance <= 0) return 0;
  return Math.min(100, Math.round((distance / strongRange) * 100));
}

export function getConditionDescription(condition: ScanCondition): string {
  const paramStr = Object.entries(condition.params)
    .map(([, v]) => v)
    .join(', ');
  const indicatorStr = paramStr ? `${condition.indicator}(${paramStr})` : condition.indicator;

  const operatorLabels: Record<string, string> = {
    '<': 'is below',
    '>': 'is above',
    '<=': 'is at or below',
    '>=': 'is at or above',
    '==': 'equals',
    'crosses_above': 'crosses above',
    'crosses_below': 'crosses below',
    'between': 'is between',
    'outside': 'is outside',
  };

  const opLabel = operatorLabels[condition.operator] ?? condition.operator;
  const valueStr = condition.value === 'dynamic' && condition.dynamicRef
    ? condition.dynamicRef
    : String(condition.value);

  return `${indicatorStr} ${opLabel} ${valueStr} on ${condition.timeframe}`;
}

export function flattenConditions(group: ScanConditionGroup): ScanCondition[] {
  const result: ScanCondition[] = [];
  for (const item of group.conditions) {
    if ('conditions' in item && Array.isArray((item as ScanConditionGroup).conditions)) {
      result.push(...flattenConditions(item as ScanConditionGroup));
    } else {
      result.push(item as ScanCondition);
    }
  }
  return result;
}
