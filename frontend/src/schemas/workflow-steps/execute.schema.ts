import type { FieldSchema } from '../../lib/dynamic-form/types';

export const executeFieldSchema: FieldSchema[] = [
  {
    key: 'approval_mode',
    type: 'pill_group',
    label: 'Approval Mode',
    required: true,
    defaultValue: 'human_approval',
    order: 1,
    constraints: {
      options: [
        { value: 'human_approval', label: 'Human Approval', description: 'Review before executing' },
        { value: 'auto', label: 'Auto Execute', description: 'Execute trades automatically' },
      ],
    },
  },
  {
    key: 'order_types_allowed',
    type: 'multi_select',
    label: 'Allowed Order Types',
    required: true,
    defaultValue: ['market', 'limit'],
    order: 2,
    constraints: {
      minItems: 1,
      options: [
        { value: 'market', label: 'Market' },
        { value: 'limit', label: 'Limit' },
        { value: 'stop', label: 'Stop' },
      ],
    },
  },
  {
    key: 'default_order_type',
    type: 'pill_group',
    label: 'Default Order Type',
    required: true,
    defaultValue: 'limit',
    order: 3,
    constraints: {
      options: [
        { value: 'market', label: 'Market' },
        { value: 'limit', label: 'Limit' },
        { value: 'stop', label: 'Stop' },
      ],
    },
  },
  {
    key: 'limit_offset_bps',
    type: 'number',
    label: 'Limit Offset',
    description: 'Offset from current price for limit orders.',
    defaultValue: 10,
    order: 4,
    showWhen: {
      or: [
        { field: 'default_order_type', operator: 'eq', value: 'limit' },
        { field: 'order_types_allowed', operator: 'contains', value: 'limit' },
      ],
    },
    constraints: { min: 0, max: 500, step: 1, unit: 'bps', unitPosition: 'suffix' },
  },
  {
    key: 'dry_run_first',
    type: 'toggle',
    label: 'Dry Run First',
    description: 'Simulate trade before executing live.',
    defaultValue: true,
    order: 5,
  },
];
