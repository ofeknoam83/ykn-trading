import { useEffect, useState } from 'react';
import { getExchanges } from '../../api/client';

interface Exchange {
  id: string;
  name: string;
}

interface ExchangePickerProps {
  value?: string;
  onChange: (exchangeId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ExchangePicker({
  value = '',
  onChange,
  placeholder = 'Select exchange',
  disabled,
}: ExchangePickerProps) {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExchanges()
      .then((r) => setExchanges(r.exchanges || []))
      .catch(() => setExchanges([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <select
      className="exchange-picker"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
    >
      <option value="">{loading ? 'Loading...' : placeholder}</option>
      {exchanges.map((ex) => (
        <option key={ex.id} value={ex.id}>
          {ex.name}
        </option>
      ))}
    </select>
  );
}
