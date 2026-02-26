import type { FieldComponentProps } from '../types';

/**
 * Placeholder for OptionChainPicker integration.
 * Renders a simplified interface until the full OptionChainPicker component exists.
 */
export function OptionChainField({ field, value, onChange, disabled }: FieldComponentProps) {
  const items = (Array.isArray(value) ? value : []) as Array<{
    symbol: string;
    expiry: string;
    strike: number;
    type: 'call' | 'put';
    action: 'buy' | 'sell';
    quantity: number;
  }>;

  function addLeg() {
    onChange([
      ...items,
      { symbol: '', expiry: '', strike: 0, type: 'call', action: 'buy', quantity: 1 },
    ]);
  }

  function removeLeg(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function updateLeg(index: number, prop: string, val: unknown) {
    onChange(items.map((item, i) => (i === index ? { ...item, [prop]: val } : item)));
  }

  return (
    <div className="df-option-chain-field">
      {items.map((leg, i) => (
        <div key={i} className="df-kv-row">
          <input
            type="text"
            value={leg.symbol}
            onChange={e => updateLeg(i, 'symbol', e.target.value)}
            placeholder="Symbol"
            disabled={disabled}
            style={{ width: '80px' }}
          />
          <select
            value={leg.type}
            onChange={e => updateLeg(i, 'type', e.target.value)}
            disabled={disabled}
          >
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
          <select
            value={leg.action}
            onChange={e => updateLeg(i, 'action', e.target.value)}
            disabled={disabled}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <input
            type="number"
            value={leg.strike}
            onChange={e => updateLeg(i, 'strike', Number(e.target.value))}
            placeholder="Strike"
            disabled={disabled}
            style={{ width: '80px' }}
          />
          <input
            type="number"
            value={leg.quantity}
            onChange={e => updateLeg(i, 'quantity', Number(e.target.value))}
            placeholder="Qty"
            disabled={disabled}
            style={{ width: '60px' }}
            min={1}
          />
          <button
            type="button"
            className="df-kv-remove"
            onClick={() => removeLeg(i)}
            disabled={disabled}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        className="df-array-add"
        onClick={addLeg}
        disabled={disabled || field.readOnly}
      >
        + Add Leg
      </button>
    </div>
  );
}
