import type { FieldSchema } from '../../lib/dynamic-form/types';

export const analyzeMarketFieldSchema: FieldSchema[] = [
  {
    key: 'assets',
    type: 'tags',
    label: 'Assets',
    description: 'Symbols to analyze. Leave empty to analyze all portfolio assets.',
    placeholder: 'Type symbol + Enter (e.g. AAPL)',
    order: 1,
  },
  {
    key: 'depth',
    type: 'pill_group',
    label: 'Analysis Depth',
    required: true,
    order: 2,
    defaultValue: 'brief',
    constraints: {
      options: [
        { value: 'brief', label: 'Brief', description: 'Quick overview of key metrics' },
        { value: 'thorough', label: 'Thorough', description: 'Deep dive with multiple data sources' },
      ],
    },
  },
  {
    key: 'focus_areas',
    type: 'multi_select',
    label: 'Focus Areas',
    required: true,
    order: 3,
    defaultValue: ['price_action', 'technicals'],
    constraints: {
      minItems: 1,
      options: [
        { value: 'price_action', label: 'Price Action' },
        { value: 'volume', label: 'Volume' },
        { value: 'technicals', label: 'Technicals' },
        { value: 'news_sentiment', label: 'News Sentiment' },
        { value: 'sector_trends', label: 'Sector Trends' },
      ],
    },
  },
];
