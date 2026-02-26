import { useState } from 'react';

interface ValueInputProps {
  value: number | 'dynamic';
  dynamicRef?: string;
  onChange: (value: number | 'dynamic', dynamicRef?: string) => void;
}

const DYNAMIC_REFS = [
  'SMA(20)', 'SMA(50)', 'SMA(200)',
  'EMA(20)', 'EMA(50)',
  'VWAP',
  'BB_Upper(20)', 'BB_Lower(20)', 'BB_Mid(20)',
];

export function ValueInput({ value, dynamicRef, onChange }: ValueInputProps) {
  const [isDynamic, setIsDynamic] = useState(value === 'dynamic');

  const toggleMode = () => {
    if (isDynamic) {
      setIsDynamic(false);
      onChange(0);
    } else {
      setIsDynamic(true);
      onChange('dynamic', DYNAMIC_REFS[0]);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {isDynamic ? (
        <select
          value={dynamicRef ?? DYNAMIC_REFS[0]}
          onChange={(e) => onChange('dynamic', e.target.value)}
        >
          {DYNAMIC_REFS.map((ref) => (
            <option key={ref} value={ref}>{ref}</option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          value={typeof value === 'number' ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          step="any"
        />
      )}
      <button
        onClick={toggleMode}
        title={isDynamic ? 'Switch to static value' : 'Switch to dynamic reference'}
        style={{
          padding: '2px 4px',
          fontSize: 10,
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: 3,
          color: '#8b949e',
          cursor: 'pointer',
        }}
      >
        {isDynamic ? '#' : 'f(x)'}
      </button>
    </div>
  );
}
