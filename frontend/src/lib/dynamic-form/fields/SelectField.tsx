import { useState, useRef, useEffect } from 'react';
import type { FieldComponentProps } from '../types';

export function SelectField({ field, value, onChange, disabled }: FieldComponentProps) {
  const options = field.constraints?.options ?? [];
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const showSearch = options.length > 7;

  const selectedOption = options.find(o => o.value === value);

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

  return (
    <div className="df-select-field" ref={containerRef}>
      <button
        type="button"
        className="df-select-trigger"
        onClick={() => !disabled && !field.readOnly && setOpen(!open)}
        disabled={disabled || field.readOnly}
        id={`df-${field.key}`}
      >
        <span className="df-select-value">
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="df-select-icon">{selectedOption.icon}</span>}
              {selectedOption.label}
            </>
          ) : (
            <span className="df-select-placeholder">{field.placeholder ?? 'Select...'}</span>
          )}
        </span>
        <span className="df-select-arrow">{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div className="df-select-dropdown">
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
          <div className="df-select-options">
            {filtered.map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                className={`df-select-option ${opt.value === value ? 'df-select-option-active' : ''} ${opt.disabled ? 'df-select-option-disabled' : ''}`}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value);
                    setOpen(false);
                    setFilter('');
                  }
                }}
                disabled={opt.disabled}
                title={opt.disabled ? opt.disabledReason : undefined}
              >
                {opt.icon && <span className="df-select-icon">{opt.icon}</span>}
                <span className="df-select-option-text">
                  <span className="df-select-option-label">{opt.label}</span>
                  {opt.description && (
                    <span className="df-select-option-desc">{opt.description}</span>
                  )}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="df-select-empty">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
