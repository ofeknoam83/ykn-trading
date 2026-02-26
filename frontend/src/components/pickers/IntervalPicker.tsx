const INTERVALS = [
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' },
  { value: '1d', label: '1 day' },
] as const;

export type IntervalValue = (typeof INTERVALS)[number]['value'];

interface IntervalPickerProps {
  value: IntervalValue | string;
  onChange: (value: IntervalValue) => void;
  disabled?: boolean;
}

export function IntervalPicker({ value, onChange, disabled }: IntervalPickerProps) {
  return (
    <select
      className="interval-picker"
      value={value}
      onChange={(e) => onChange(e.target.value as IntervalValue)}
      disabled={disabled}
    >
      {INTERVALS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export { INTERVALS };
