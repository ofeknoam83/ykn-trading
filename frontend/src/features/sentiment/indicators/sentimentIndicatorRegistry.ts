// Register all sentiment indicators into the existing indicator engine

import type { IndicatorDef, ConditionOperator, Timeframe } from '../../scanner/types/scanner.types';
import { SENTIMENT_INDICATOR_DEFS } from './sentimentIndicatorDefs';

/** Convert sentiment indicator defs to the scanner IndicatorDef format */
export function getSentimentIndicatorsForScanner(): IndicatorDef[] {
  return SENTIMENT_INDICATOR_DEFS.map((def) => ({
    id: def.code,
    name: def.name,
    category: def.subcategory as IndicatorDef['category'],
    type: 'technical' as const,   // treated as technical in condition system
    defaultParams: Object.fromEntries(def.params.map((p) => [p.name, p.default])),
    paramLabels: Object.fromEntries(def.params.map((p) => [p.name, p.description])),
    valueRange: { min: def.outputRange.min, max: def.outputRange.max },
    supportedOperators: ['<', '>', '<=', '>=', '==', 'crosses_above', 'crosses_below', 'between'] as ConditionOperator[],
    supportedTimeframes: def.availableTimeframes as Timeframe[],
    description: def.description,
  }));
}

/** Sentiment indicator category entries for the scanner category list */
export const SENTIMENT_CATEGORIES = [
  { id: 'news', label: 'News Sentiment', subcategory: 'news' as const },
  { id: 'social', label: 'Social Signals', subcategory: 'social' as const },
  { id: 'institutional', label: 'Institutional', subcategory: 'institutional' as const },
  { id: 'earnings_sent', label: 'Earnings', subcategory: 'earnings' as const },
  { id: 'event_sent', label: 'Events', subcategory: 'event' as const },
  { id: 'composite_sent', label: 'Composite', subcategory: 'composite' as const },
];

/** Check if an indicator code is a sentiment indicator */
export function isSentimentIndicator(code: string): boolean {
  return SENTIMENT_INDICATOR_DEFS.some((d) => d.code === code);
}
