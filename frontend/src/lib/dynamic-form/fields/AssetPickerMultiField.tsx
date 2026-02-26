import { useState } from 'react';
import type { FieldComponentProps } from '../types';
import { AssetPicker } from '../../../components/pickers/AssetPicker';

export function AssetPickerMultiField({ field, value, onChange, disabled }: FieldComponentProps) {
  const selected = (Array.isArray(value) ? value : []) as string[];
  const [showPicker, setShowPicker] = useState(false);

  function addSymbol(symbol: string) {
    if (!symbol || selected.includes(symbol)) return;
    onChange([...selected, symbol]);
    setShowPicker(false);
  }

  function removeSymbol(symbol: string) {
    onChange(selected.filter(s => s !== symbol));
  }

  return (
    <div className="df-asset-multi-field">
      {selected.length > 0 && (
        <div className="df-multi-chips">
          {selected.map(s => (
            <span key={s} className="df-chip">
              {s}
              <button
                type="button"
                className="df-chip-remove"
                onClick={() => removeSymbol(s)}
                disabled={disabled}
                aria-label={`Remove ${s}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
      {showPicker ? (
        <AssetPicker
          value=""
          onChange={(symbol) => addSymbol(symbol)}
          placeholder={field.placeholder ?? 'Search asset...'}
          disabled={disabled || field.readOnly}
        />
      ) : (
        <button
          type="button"
          className="df-array-add"
          onClick={() => setShowPicker(true)}
          disabled={disabled || field.readOnly}
        >
          + Add Asset
        </button>
      )}
    </div>
  );
}
