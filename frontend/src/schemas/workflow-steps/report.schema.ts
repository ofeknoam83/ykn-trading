import type { FieldSchema } from '../../lib/dynamic-form/types';

export const reportFieldSchema: FieldSchema[] = [
  {
    key: 'format',
    type: 'pill_group',
    label: 'Report Format',
    required: true,
    defaultValue: 'brief',
    order: 1,
    constraints: {
      options: [
        { value: 'brief', label: 'Brief', description: 'Key points only' },
        { value: 'detailed', label: 'Detailed', description: 'Full analysis with charts' },
      ],
    },
  },
  {
    key: 'include_reasoning_chain',
    type: 'toggle',
    label: 'Include Reasoning Chain',
    description: 'Show the step-by-step logic that led to decisions.',
    defaultValue: true,
    group: 'Contents',
    groupOrder: 2,
    order: 1,
  },
  {
    key: 'include_portfolio_snapshot',
    type: 'toggle',
    label: 'Include Portfolio Snapshot',
    defaultValue: true,
    group: 'Contents',
    groupOrder: 2,
    order: 2,
  },
  {
    key: 'include_market_summary',
    type: 'toggle',
    label: 'Include Market Summary',
    defaultValue: false,
    group: 'Contents',
    groupOrder: 2,
    order: 3,
  },
  {
    key: 'delivery',
    type: 'pill_group',
    label: 'Delivery',
    required: true,
    defaultValue: 'store',
    order: 10,
    constraints: {
      options: [
        { value: 'log_only', label: 'Log Only', description: 'Save to run logs' },
        { value: 'store', label: 'Store', description: 'Save as persistent report' },
      ],
    },
  },
];
