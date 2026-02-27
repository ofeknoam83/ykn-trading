import { useState, useEffect, useCallback } from 'react';
import { searchSymbols } from '../../api/client';

interface SymbolInfo {
  symbol: string;
  name: string;
  asset_class?: string;
  exchange?: string;
}

interface AssetPickerProps {
  value?: string;
  onChange: (symbol: string, info?: SymbolInfo) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AssetPicker({ value = '', onChange, placeholder = 'Search symbol...', disabled }: AssetPickerProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SymbolInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync internal query state when parent value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { results: r } = await searchSymbols(q);
      setResults(r || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div className="asset-picker">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {loading && <span className="hint">Searching...</span>}
      {open && results.length > 0 && (
        <ul className="dropdown">
          {results.map((r) => (
            <li
              key={r.symbol}
              onMouseDown={() => {
                setQuery(r.symbol);
                onChange(r.symbol, r);
                setOpen(false);
              }}
            >
              <strong>{r.symbol}</strong>
              {r.name && <span className="name"> – {r.name}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
