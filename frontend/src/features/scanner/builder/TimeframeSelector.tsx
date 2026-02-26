import type { Timeframe } from '../types/scanner.types';

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1m', label: '1 min' },
  { value: '5m', label: '5 min' },
  { value: '15m', label: '15 min' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hour' },
  { value: '1d', label: 'Daily' },
  { value: '1w', label: 'Weekly' },
  { value: '1M', label: 'Monthly' },
];

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
  supportedTimeframes?: Timeframe[];
}

export function TimeframeSelector({ value, onChange, supportedTimeframes }: TimeframeSelectorProps) {
  const options = supportedTimeframes
    ? TIMEFRAMES.filter((tf) => supportedTimeframes.includes(tf.value))
    : TIMEFRAMES;

  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Timeframe)}>
      {options.map((tf) => (
        <option key={tf.value} value={tf.value}>
          {tf.label}
        </option>
      ))}
    </select>
  );
}
