import type { ComponentType } from 'react';
import type { FieldComponentProps, FieldType } from './types';

import { TextField } from './fields/TextField';
import { TextAreaField } from './fields/TextAreaField';
import { NumberField } from './fields/NumberField';
import { SliderField } from './fields/SliderField';
import { ToggleField } from './fields/ToggleField';
import { CheckboxField } from './fields/CheckboxField';
import { SelectField } from './fields/SelectField';
import { MultiSelectField } from './fields/MultiSelectField';
import { RadioField } from './fields/RadioField';
import { PillGroupField } from './fields/PillGroupField';
import { TagsField } from './fields/TagsField';
import { KeyValueField } from './fields/KeyValueField';
import { CodeField } from './fields/CodeField';
import { ObjectField } from './fields/ObjectField';
import { ArrayField } from './fields/ArrayField';
import { CustomField } from './fields/CustomField';
import { AssetPickerField } from './fields/AssetPickerField';
import { AssetPickerMultiField } from './fields/AssetPickerMultiField';
import { DateRangeField } from './fields/DateRangeField';
import { IntervalField } from './fields/IntervalField';
import { BenchmarkField } from './fields/BenchmarkField';
import { OptionChainField } from './fields/OptionChainField';

export const FIELD_COMPONENT_REGISTRY: Record<string, ComponentType<FieldComponentProps>> = {
  text: TextField,
  textarea: TextAreaField,
  number: NumberField,
  slider: SliderField,
  toggle: ToggleField,
  checkbox: CheckboxField,
  select: SelectField,
  multi_select: MultiSelectField,
  radio: RadioField,
  pill_group: PillGroupField,
  tags: TagsField,
  key_value: KeyValueField,
  code: CodeField,
  object: ObjectField,
  array: ArrayField,
  custom: CustomField,
  asset_picker: AssetPickerField,
  asset_picker_multi: AssetPickerMultiField,
  date_range: DateRangeField,
  interval: IntervalField,
  benchmark: BenchmarkField,
  option_chain: OptionChainField,
};

/**
 * Register a custom field component at runtime.
 * Used for escape-hatch custom components.
 */
export function registerFieldComponent(
  name: FieldType | string,
  component: ComponentType<FieldComponentProps>,
) {
  FIELD_COMPONENT_REGISTRY[name] = component;
}
