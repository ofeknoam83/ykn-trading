import { useState } from 'react';
import type { FieldComponentProps } from '../types';

export function TagsField({ field, value, onChange, disabled }: FieldComponentProps) {
  const tags = (Array.isArray(value) ? value : []) as string[];
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<string | null>(null);
  const maxItems = field.constraints?.maxItems;

  function addTag() {
    const tag = input.trim();
    if (!tag) return;

    if (tags.includes(tag)) {
      setFlash(tag);
      setTimeout(() => setFlash(null), 400);
      return;
    }

    if (maxItems && tags.length >= maxItems) return;

    onChange([...tags, tag]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter(t => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="df-tags-field">
      {tags.length > 0 && (
        <div className="df-tags-chips">
          {tags.map(tag => (
            <span
              key={tag}
              className={`df-chip ${flash === tag ? 'df-chip-flash' : ''}`}
            >
              {tag}
              <button
                type="button"
                className="df-chip-remove"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                aria-label={`Remove ${tag}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        id={`df-${field.key}`}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={field.placeholder ?? 'Type + Enter...'}
        disabled={disabled || field.readOnly || (maxItems !== undefined && tags.length >= maxItems)}
        autoComplete="off"
      />
    </div>
  );
}
