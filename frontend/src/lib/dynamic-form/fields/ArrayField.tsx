import type { FieldComponentProps } from '../types';
import { inferDefault } from '../defaults';

export function ArrayField({ field, value, onChange, disabled }: FieldComponentProps) {
  const items = (Array.isArray(value) ? value : []) as unknown[];
  const minItems = field.constraints?.minItems;
  const maxItems = field.constraints?.maxItems;
  const itemSchema = field.itemSchema;

  function addItem() {
    if (maxItems && items.length >= maxItems) return;
    const defaultVal = itemSchema ? inferDefault(itemSchema) : '';
    onChange([...items, defaultVal]);
  }

  function removeItem(index: number) {
    if (minItems && items.length <= minItems) return;
    onChange(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, newValue: unknown) {
    onChange(items.map((item, i) => (i === index ? newValue : item)));
  }

  return (
    <div className="df-array-field">
      {items.map((item, i) => (
        <div key={i} className="df-array-item">
          <span className="df-array-index">#{i + 1}</span>
          <div className="df-array-item-content">
            {itemSchema?.type === 'text' || itemSchema?.type === 'textarea' || !itemSchema ? (
              <input
                type="text"
                value={String(item ?? '')}
                onChange={e => updateItem(i, e.target.value)}
                placeholder={itemSchema?.placeholder}
                disabled={disabled}
              />
            ) : itemSchema?.type === 'number' || itemSchema?.type === 'slider' ? (
              <input
                type="number"
                value={typeof item === 'number' ? item : ''}
                onChange={e => {
                  const n = Number(e.target.value);
                  updateItem(i, isNaN(n) ? e.target.value : n);
                }}
                min={itemSchema.constraints?.min}
                max={itemSchema.constraints?.max}
                step={itemSchema.constraints?.step}
                disabled={disabled}
              />
            ) : (
              <input
                type="text"
                value={String(item ?? '')}
                onChange={e => updateItem(i, e.target.value)}
                disabled={disabled}
              />
            )}
          </div>
          <button
            type="button"
            className="df-array-remove"
            onClick={() => removeItem(i)}
            disabled={disabled || (minItems !== undefined && items.length <= minItems)}
            aria-label={`Remove item ${i + 1}`}
          >
            &#128465;
          </button>
        </div>
      ))}

      <button
        type="button"
        className="df-array-add"
        onClick={addItem}
        disabled={disabled || field.readOnly || (maxItems !== undefined && items.length >= maxItems)}
      >
        + Add Item
      </button>

      {(minItems || maxItems) && (
        <p className="df-field-hint">
          {minItems && maxItems
            ? `${minItems}\u2013${maxItems} items`
            : minItems
              ? `At least ${minItems} item${minItems > 1 ? 's' : ''}`
              : `Maximum ${maxItems} items`}
          {maxItems && ` \u00B7 ${items.length} of ${maxItems}`}
        </p>
      )}
    </div>
  );
}
