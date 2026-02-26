import type { FieldSchema } from '../../lib/dynamic-form/types';

export const fetchPortfolioFieldSchema: FieldSchema[] = [
  {
    key: 'include_open_orders',
    type: 'toggle',
    label: 'Include Open Orders',
    defaultValue: true,
    order: 1,
  },
  {
    key: 'include_historical_positions',
    type: 'toggle',
    label: 'Include Historical Positions',
    defaultValue: false,
    order: 2,
  },
  {
    key: 'lookback_days',
    type: 'slider',
    label: 'Lookback Days',
    description: 'Number of days of historical positions to include.',
    defaultValue: 30,
    order: 3,
    showWhen: { field: 'include_historical_positions', operator: 'eq', value: true },
    constraints: {
      min: 1,
      max: 365,
      step: 1,
      unit: 'days',
    },
  },
];
