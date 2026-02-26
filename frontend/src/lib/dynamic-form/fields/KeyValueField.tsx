import type { FieldComponentProps } from '../types';

interface KVPair {
  key: string;
  value: string;
}

export function KeyValueField({ field, value, onChange, disabled }: FieldComponentProps) {
  const pairs = (Array.isArray(value) ? value : []) as KVPair[];

  function updatePair(index: number, prop: 'key' | 'value', newVal: string) {
    const updated = pairs.map((p, i) => (i === index ? { ...p, [prop]: newVal } : p));
    onChange(updated);
  }

  function addPair() {
    onChange([...pairs, { key: '', value: '' }]);
  }

  function removePair(index: number) {
    onChange(pairs.filter((_, i) => i !== index));
  }

  return (
    <div className="df-kv-field">
      {pairs.map((pair, i) => (
        <div key={i} className="df-kv-row">
          <input
            type="text"
            className="df-kv-key"
            value={pair.key}
            onChange={e => updatePair(i, 'key', e.target.value)}
            placeholder="Key"
            disabled={disabled}
          />
          <input
            type="text"
            className="df-kv-value"
            value={pair.value}
            onChange={e => updatePair(i, 'value', e.target.value)}
            placeholder="Value"
            disabled={disabled}
          />
          <button
            type="button"
            className="df-kv-remove"
            onClick={() => removePair(i)}
            disabled={disabled}
            aria-label="Remove pair"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        className="df-array-add"
        onClick={addPair}
        disabled={disabled || field.readOnly}
      >
        + Add Entry
      </button>
    </div>
  );
}
