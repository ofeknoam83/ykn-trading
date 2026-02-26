import { useState } from 'react';

const PRESETS = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
  { label: '5Y', days: 365 * 5 },
] as const;

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: boolean;
}

export function DateRangePicker({ value, onChange, disabled }: DateRangePickerProps) {
  const [custom, setCustom] = useState(!PRESETS.some((p) => {
    const end = new Date(value.end);
    const start = new Date(value.start);
    const days = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return p.days === days;
  }));

  function applyPreset(days: number) {
    const end = new Date();
    const start = addDays(end, -days);
    onChange({ start: toDateStr(start), end: toDateStr(end) });
    setCustom(false);
  }

  return (
    <div className="date-range-picker">
      <div className="presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`preset-btn ${!custom && value.start && value.end ? (() => {
              const end = new Date(value.end);
              const start = new Date(value.start);
              const days = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
              return p.days === days ? 'active' : '';
            })() : ''}`}
            onClick={() => applyPreset(p.days)}
            disabled={disabled}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="custom-dates">
        <input
          type="date"
          value={value.start}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          onFocus={() => setCustom(true)}
          disabled={disabled}
        />
        <span className="separator">–</span>
        <input
          type="date"
          value={value.end}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
          onFocus={() => setCustom(true)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
