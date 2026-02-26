import { useState, useRef, useEffect } from 'react';
import type { FieldComponentProps } from '../types';

export function MultiSelectField({ field, value, onChange, disabled }: FieldComponentProps) {
  const options = field.constraints?.options ?? [];
  const selected = (Array.isArray(value) ? value : []) as (string | number | boolean)[];
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const showSearch = options.length > 7;
  const maxItems = field.constraints?.maxItems;
  const minItems = field.constraints?.minItems;

  const filtered = filter
    ? options.filter(o => o.label.toLowerCase().includes(filter.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFilter('');
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function toggle(optValue: string | number | boolean) {
    if (selected.includes(optValue)) {
      onChange(selected.filter(v => v !== optValue));
    } else {
      if (maxItems && selected.length >= maxItems) return;
      onChange([...selected, optValue]);
    }
  }

  function selectAll() {
    const all = options.filter(o => !o.disabled).map(o => o.value);
    if (maxItems) {
      onChange(all.slice(0, maxItems));
    } else {
      onChange(all);
    }
  }

  function clearAll() {
    onChange([]);
  }

  function removeChip(optValue: string | number | boolean) {
    onChange(selected.filter(v => v !== optValue));
  }

  return (
    <div className="df-multi-select-field" ref={containerRef}>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="df-multi-chips">
          {selected.map(v => {
            const opt = options.find(o => o.value === v);
            return (
              <span key={String(v)} className="df-chip">
                {opt?.label ?? String(v)}
                <button
                  type="button"
                  className="df-chip-remove"
                  onClick={() => removeChip(v)}
                  disabled={disabled}
                  aria-label={`Remove ${opt?.label ?? String(v)}`}
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="df-select-trigger"
        onClick={() => !disabled && !field.readOnly && setOpen(!open)}
        disabled={disabled || field.readOnly}
        id={`df-${field.key}`}
      >
        <span className="df-select-value">
          <span className="df-select-placeholder">
            {selected.length === 0
              ? (field.placeholder ?? 'Select...')
              : `${selected.length} selected`}
          </span>
        </span>
        <span className="df-select-arrow">{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div className="df-select-dropdown">
          {(showSearch || options.length > 5) && (
            <div className="df-multi-controls">
              {showSearch && (
                <input
                  type="text"
                  className="df-select-search"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                />
              )}
              <div className="df-multi-actions">
                <button type="button" className="df-multi-action" onClick={selectAll}>
                  Select All
                </button>
                <button type="button" className="df-multi-action" onClick={clearAll}>
                  Clear
                </button>
              </div>
            </div>
          )}
          <div className="df-select-options">
            {filtered.map(opt => (
              <label
                key={String(opt.value)}
                className={`df-multi-option ${opt.disabled ? 'df-select-option-disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  disabled={opt.disabled || (maxItems !== undefined && selected.length >= maxItems && !selected.includes(opt.value))}
                />
                {opt.icon && <span className="df-select-icon">{opt.icon}</span>}
                <span className="df-select-option-text">
                  <span className="df-select-option-label">{opt.label}</span>
                  {opt.description && (
                    <span className="df-select-option-desc">{opt.description}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {minItems && (
        <p className="df-field-hint">Select at least {minItems} item{minItems > 1 ? 's' : ''}</p>
      )}
    </div>
  );
}
