import { useState } from 'react';
import type { FieldComponentProps } from '../types';

export function SliderField({ field, value, onChange, disabled }: FieldComponentProps) {
  const c = field.constraints;
  const min = c?.min ?? 0;
  const max = c?.max ?? 100;
  const step = c?.step ?? 1;
  const unit = c?.unit ?? '';
  const numValue = typeof value === 'number' ? value : min;
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value));
  }

  function startEditing() {
    setEditText(String(numValue));
    setEditing(true);
  }

  function commitEdit() {
    const n = Number(editText);
    if (!isNaN(n)) {
      const clamped = Math.min(max, Math.max(min, n));
      onChange(clamped);
    }
    setEditing(false);
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
  }

  return (
    <div className="df-slider-field">
      <div className="df-slider-track">
        <input
          type="range"
          id={`df-${field.key}`}
          value={numValue}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled || field.readOnly}
        />
      </div>
      <div className="df-slider-value" onClick={startEditing}>
        {editing ? (
          <input
            type="number"
            className="df-slider-edit"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleEditKeyDown}
            autoFocus
            min={min}
            max={max}
            step={step}
          />
        ) : (
          <span>{numValue}{unit ? ` ${unit}` : ''}</span>
        )}
      </div>
      <div className="df-slider-bounds">
        <span>{min}{unit ? ` ${unit}` : ''}</span>
        <span>{max}{unit ? ` ${unit}` : ''}</span>
      </div>
    </div>
  );
}
