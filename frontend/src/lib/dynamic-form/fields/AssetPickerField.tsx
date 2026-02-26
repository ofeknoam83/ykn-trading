import type { FieldComponentProps } from '../types';
import { AssetPicker } from '../../../components/pickers/AssetPicker';

export function AssetPickerField({ field, value, onChange, disabled }: FieldComponentProps) {
  return (
    <AssetPicker
      value={(value as string) ?? ''}
      onChange={(symbol) => onChange(symbol)}
      placeholder={field.placeholder ?? 'Search asset...'}
      disabled={disabled || field.readOnly}
    />
  );
}
