import type { FieldSchema } from '../../lib/dynamic-form/types';

export const conditionFieldSchema: FieldSchema[] = [
  {
    key: 'condition_type',
    type: 'select',
    label: 'Condition Type',
    required: true,
    defaultValue: 'volatility_above',
    order: 1,
    constraints: {
      options: [
        { value: 'volatility_above', label: 'Volatility Above', description: 'VIX exceeds threshold' },
        { value: 'position_count_above', label: 'Position Count Above', description: 'Open positions exceed count' },
        { value: 'portfolio_pnl_above', label: 'Portfolio PnL Above', description: 'PnL exceeds percentage' },
        { value: 'portfolio_pnl_below', label: 'Portfolio PnL Below', description: 'PnL below percentage' },
        { value: 'market_session', label: 'Market Session', description: 'Market is open/pre/post/closed' },
        { value: 'news_sentiment', label: 'News Sentiment', description: 'Sentiment of news for a symbol' },
        { value: 'time_window', label: 'Time Window', description: 'Current time within window' },
        { value: 'custom_expression', label: 'Custom Expression', description: 'Freeform expression' },
      ],
    },
  },
  // Volatility params
  {
    key: 'params.threshold',
    type: 'number',
    label: 'Threshold',
    defaultValue: 25,
    order: 2,
    showWhen: {
      field: 'condition_type',
      operator: 'in',
      value: ['volatility_above', 'position_count_above'],
    },
    constraints: { min: 0, step: 1 },
  },
  // PnL params
  {
    key: 'params.threshold_pct',
    type: 'number',
    label: 'Threshold %',
    defaultValue: 5,
    order: 2,
    showWhen: {
      field: 'condition_type',
      operator: 'in',
      value: ['portfolio_pnl_above', 'portfolio_pnl_below'],
    },
    constraints: { min: -100, max: 1000, step: 0.5, unit: '%' },
  },
  // Market session params
  {
    key: 'params.session',
    type: 'pill_group',
    label: 'Session',
    defaultValue: 'open',
    order: 2,
    showWhen: { field: 'condition_type', operator: 'eq', value: 'market_session' },
    constraints: {
      options: [
        { value: 'pre', label: 'Pre-Market' },
        { value: 'open', label: 'Open' },
        { value: 'post', label: 'Post-Market' },
        { value: 'closed', label: 'Closed' },
      ],
    },
  },
  // News sentiment params
  {
    key: 'params.symbol',
    type: 'text',
    label: 'Symbol (optional)',
    placeholder: 'e.g. AAPL',
    order: 2,
    showWhen: { field: 'condition_type', operator: 'eq', value: 'news_sentiment' },
  },
  {
    key: 'params.sentiment',
    type: 'pill_group',
    label: 'Sentiment',
    defaultValue: 'positive',
    order: 3,
    showWhen: { field: 'condition_type', operator: 'eq', value: 'news_sentiment' },
    constraints: {
      options: [
        { value: 'positive', label: 'Positive' },
        { value: 'negative', label: 'Negative' },
        { value: 'neutral', label: 'Neutral' },
      ],
    },
  },
  // Time window params
  {
    key: 'params.start_hour',
    type: 'number',
    label: 'Start Hour (0-23)',
    defaultValue: 9,
    order: 2,
    showWhen: { field: 'condition_type', operator: 'eq', value: 'time_window' },
    constraints: { min: 0, max: 23, step: 1 },
  },
  {
    key: 'params.end_hour',
    type: 'number',
    label: 'End Hour (0-23)',
    defaultValue: 16,
    order: 3,
    showWhen: { field: 'condition_type', operator: 'eq', value: 'time_window' },
    constraints: { min: 0, max: 23, step: 1 },
  },
  {
    key: 'params.timezone',
    type: 'select',
    label: 'Timezone',
    defaultValue: 'US/Eastern',
    order: 4,
    showWhen: { field: 'condition_type', operator: 'eq', value: 'time_window' },
    constraints: {
      options: [
        { value: 'US/Eastern', label: 'US Eastern' },
        { value: 'US/Central', label: 'US Central' },
        { value: 'US/Pacific', label: 'US Pacific' },
        { value: 'UTC', label: 'UTC' },
        { value: 'Europe/London', label: 'London' },
        { value: 'Asia/Tokyo', label: 'Tokyo' },
      ],
    },
  },
  // Custom expression
  {
    key: 'params.expression',
    type: 'code',
    label: 'Expression',
    placeholder: 'Enter a boolean expression...',
    order: 2,
    showWhen: { field: 'condition_type', operator: 'eq', value: 'custom_expression' },
    constraints: { language: 'text', minLines: 3, maxLines: 10 },
  },
  // Branch labels
  {
    key: 'true_label',
    type: 'text',
    label: 'True Branch Label',
    defaultValue: 'Yes',
    order: 20,
    placeholder: 'Label for true branch',
  },
  {
    key: 'false_label',
    type: 'text',
    label: 'False Branch Label',
    defaultValue: 'No',
    order: 21,
    placeholder: 'Label for false branch',
  },
];
