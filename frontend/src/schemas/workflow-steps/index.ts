import type { FieldSchema } from '../../lib/dynamic-form/types';
import type { StepType } from '../../types/workflow';

import { analyzeMarketFieldSchema } from './analyze-market.schema';
import { fetchPortfolioFieldSchema } from './fetch-portfolio.schema';
import { evaluatePositionsFieldSchema } from './evaluate-positions.schema';
import { researchFieldSchema } from './research.schema';
import { decideActionsFieldSchema } from './decide-actions.schema';
import { executeFieldSchema } from './execute.schema';
import { reportFieldSchema } from './report.schema';
import { conditionFieldSchema } from './condition.schema';
import { customFieldSchema } from './custom.schema';

/**
 * Maps step types to their FieldSchema definitions.
 * Used by StepConfigPanel to render dynamic forms.
 */
export const STEP_FIELD_SCHEMAS: Record<StepType, FieldSchema[]> = {
  analyze_market: analyzeMarketFieldSchema,
  fetch_portfolio: fetchPortfolioFieldSchema,
  evaluate_positions: evaluatePositionsFieldSchema,
  research: researchFieldSchema,
  decide_actions: decideActionsFieldSchema,
  execute: executeFieldSchema,
  report: reportFieldSchema,
  condition: conditionFieldSchema,
  custom: customFieldSchema,
};

export {
  analyzeMarketFieldSchema,
  fetchPortfolioFieldSchema,
  evaluatePositionsFieldSchema,
  researchFieldSchema,
  decideActionsFieldSchema,
  executeFieldSchema,
  reportFieldSchema,
  conditionFieldSchema,
  customFieldSchema,
};
