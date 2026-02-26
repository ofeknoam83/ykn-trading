import type { ScanDefinition, ScanConditionGroup, ScanCondition } from '../types/scanner.types';

/**
 * Serialize/deserialize scan definitions for export/import and sharing.
 */

export function exportScanToJSON(scan: ScanDefinition): string {
  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    scan: {
      name: scan.name,
      description: scan.description,
      universe: scan.universe,
      rootGroup: scan.rootGroup,
      convergenceRules: scan.convergenceRules,
      scoring: scan.scoring,
      mode: scan.mode,
    },
  };
  return JSON.stringify(exportData, null, 2);
}

export function importScanFromJSON(json: string): Omit<ScanDefinition, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status' | 'alerts'> | null {
  try {
    const data = JSON.parse(json);
    if (!data?.scan?.name || !data?.scan?.rootGroup) return null;
    return {
      name: data.scan.name,
      description: data.scan.description,
      universe: data.scan.universe ?? { assetClass: ['us_equity'] },
      rootGroup: data.scan.rootGroup,
      convergenceRules: data.scan.convergenceRules,
      scoring: data.scan.scoring ?? { weights: { signalStrength: 0.3, historicalHitRate: 0.25, regimeCompatibility: 0.2, portfolioFit: 0.15, recency: 0.1 } },
      mode: data.scan.mode ?? 'monitor',
    };
  } catch {
    return null;
  }
}

export function conditionGroupToText(group: ScanConditionGroup, indent = 0): string {
  const prefix = '  '.repeat(indent);
  const lines: string[] = [];

  group.conditions.forEach((item, idx) => {
    if ('conditions' in item && Array.isArray((item as ScanConditionGroup).conditions)) {
      const subGroup = item as ScanConditionGroup;
      lines.push(`${prefix}(`);
      lines.push(conditionGroupToText(subGroup, indent + 1));
      lines.push(`${prefix})`);
    } else {
      const cond = item as ScanCondition;
      const paramStr = Object.values(cond.params).join(', ');
      const indicator = paramStr ? `${cond.indicator}(${paramStr})` : cond.indicator;
      const value = cond.value === 'dynamic' ? cond.dynamicRef ?? '?' : String(cond.value);
      lines.push(`${prefix}${indicator} ${cond.operator} ${value}`);
    }
    if (idx < group.conditions.length - 1) {
      lines.push(`${prefix}${group.operator}`);
    }
  });

  return lines.join('\n');
}

let nextId = 1;
export function generateId(): string {
  return `cond_${Date.now()}_${nextId++}`;
}
