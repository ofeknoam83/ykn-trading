import { useEffect, useState } from 'react';
import { getBenchmarks } from '../../api/client';

interface Benchmark {
  id: string;
  name: string;
  symbol?: string;
}

interface BenchmarkPickerProps {
  value?: string;
  onChange: (benchmarkId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function BenchmarkPicker({
  value = '',
  onChange,
  placeholder = 'Select benchmark',
  disabled,
}: BenchmarkPickerProps) {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBenchmarks()
      .then((r) => setBenchmarks(r.benchmarks || []))
      .catch(() => setBenchmarks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <select
      className="benchmark-picker"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
    >
      <option value="">{loading ? 'Loading...' : placeholder}</option>
      {benchmarks.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
