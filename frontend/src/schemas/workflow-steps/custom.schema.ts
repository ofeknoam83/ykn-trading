import type { FieldSchema } from '../../lib/dynamic-form/types';

export const customFieldSchema: FieldSchema[] = [
  {
    key: 'instruction',
    type: 'textarea',
    label: 'Instruction',
    description: 'Free-form instruction for the LLM agent.',
    required: true,
    placeholder: 'Describe what this step should do...',
    order: 1,
    constraints: { minLength: 1 },
  },
  {
    key: 'expected_output',
    type: 'pill_group',
    label: 'Expected Output',
    required: true,
    defaultValue: 'text',
    order: 2,
    constraints: {
      options: [
        { value: 'text', label: 'Text', description: 'Free-form text response' },
        { value: 'json', label: 'JSON', description: 'Structured JSON output' },
        { value: 'signal', label: 'Signal', description: 'Trading signal format' },
      ],
    },
  },
  {
    key: 'output_schema',
    type: 'code',
    label: 'Output Schema',
    description: 'Optional JSON schema defining the expected output structure.',
    order: 3,
    showWhen: { field: 'expected_output', operator: 'eq', value: 'json' },
    constraints: { language: 'json', minLines: 4, maxLines: 15 },
  },
];
