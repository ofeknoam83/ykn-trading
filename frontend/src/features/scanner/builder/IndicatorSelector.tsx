import { useState, useRef, useEffect } from 'react';
import type { IndicatorDef } from '../types/scanner.types';
import { getSentimentIndicatorsForScanner } from '../../sentiment/indicators/sentimentIndicatorRegistry';

export const INDICATOR_CATALOG: IndicatorDef[] = [
  // Momentum
  { id: 'RSI', name: 'RSI', category: 'momentum', type: 'technical', defaultParams: { period: 14 }, paramLabels: { period: 'Period' }, valueRange: { min: 0, max: 100 }, supportedOperators: ['<', '>', '<=', '>=', '==', 'crosses_above', 'crosses_below', 'between'], supportedTimeframes: ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M'], description: 'Relative Strength Index' },
  { id: 'STOCH_RSI', name: 'Stochastic RSI', category: 'momentum', type: 'technical', defaultParams: { period: 14 }, paramLabels: { period: 'Period' }, valueRange: { min: 0, max: 100 }, supportedOperators: ['<', '>', 'crosses_above', 'crosses_below', 'between'], supportedTimeframes: ['1h', '4h', '1d', '1w'], description: 'Stochastic RSI' },
  { id: 'MACD', name: 'MACD', category: 'momentum', type: 'technical', defaultParams: { fast: 12, slow: 26, signal: 9 }, paramLabels: { fast: 'Fast', slow: 'Slow', signal: 'Signal' }, supportedOperators: ['<', '>', 'crosses_above', 'crosses_below'], supportedTimeframes: ['1h', '4h', '1d', '1w'], description: 'Moving Average Convergence Divergence' },
  { id: 'CCI', name: 'CCI', category: 'momentum', type: 'technical', defaultParams: { period: 20 }, paramLabels: { period: 'Period' }, supportedOperators: ['<', '>', 'crosses_above', 'crosses_below', 'between'], supportedTimeframes: ['1h', '4h', '1d', '1w'], description: 'Commodity Channel Index' },
  { id: 'MFI', name: 'MFI', category: 'momentum', type: 'technical', defaultParams: { period: 14 }, paramLabels: { period: 'Period' }, valueRange: { min: 0, max: 100 }, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d', '1w'], description: 'Money Flow Index' },
  { id: 'ROC', name: 'Rate of Change', category: 'momentum', type: 'technical', defaultParams: { period: 12 }, paramLabels: { period: 'Period' }, supportedOperators: ['<', '>', 'crosses_above', 'crosses_below'], supportedTimeframes: ['1d', '1w'], description: 'Rate of Change' },

  // Trend
  { id: 'SMA', name: 'SMA', category: 'trend', type: 'technical', defaultParams: { period: 50 }, paramLabels: { period: 'Period' }, supportedOperators: ['<', '>', 'crosses_above', 'crosses_below'], supportedTimeframes: ['1h', '4h', '1d', '1w', '1M'], description: 'Simple Moving Average' },
  { id: 'EMA', name: 'EMA', category: 'trend', type: 'technical', defaultParams: { period: 20 }, paramLabels: { period: 'Period' }, supportedOperators: ['<', '>', 'crosses_above', 'crosses_below'], supportedTimeframes: ['1h', '4h', '1d', '1w', '1M'], description: 'Exponential Moving Average' },
  { id: 'ADX', name: 'ADX', category: 'trend', type: 'technical', defaultParams: { period: 14 }, paramLabels: { period: 'Period' }, valueRange: { min: 0, max: 100 }, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d', '1w'], description: 'Average Directional Index' },
  { id: 'VWAP', name: 'VWAP', category: 'trend', type: 'technical', defaultParams: {}, paramLabels: {}, supportedOperators: ['<', '>'], supportedTimeframes: ['1m', '5m', '15m', '1h'], description: 'Volume Weighted Average Price' },

  // Volatility
  { id: 'BB_WIDTH', name: 'Bollinger Width', category: 'volatility', type: 'technical', defaultParams: { period: 20 }, paramLabels: { period: 'Period' }, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d', '1w'], description: 'Bollinger Band Width' },
  { id: 'ATR', name: 'ATR', category: 'volatility', type: 'technical', defaultParams: { period: 14 }, paramLabels: { period: 'Period' }, supportedOperators: ['<', '>'], supportedTimeframes: ['1d', '1w'], description: 'Average True Range' },
  { id: 'BB_POSITION', name: 'BB Position', category: 'volatility', type: 'technical', defaultParams: { period: 20 }, paramLabels: { period: 'Period' }, valueRange: { min: 0, max: 1 }, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d', '1w'], description: 'Position within Bollinger Bands (0=lower, 1=upper)' },

  // Volume
  { id: 'VOLUME_RATIO', name: 'Volume Ratio', category: 'volume', type: 'volume', defaultParams: { period: 20 }, paramLabels: { period: 'Avg Period' }, supportedOperators: ['<', '>', '>='], supportedTimeframes: ['1d'], description: 'Current volume / N-day average' },
  { id: 'OBV', name: 'OBV', category: 'volume', type: 'volume', defaultParams: {}, paramLabels: {}, supportedOperators: ['<', '>', 'crosses_above', 'crosses_below'], supportedTimeframes: ['1d', '1w'], description: 'On Balance Volume' },

  // Fundamental
  { id: 'PE_RATIO', name: 'P/E Ratio', category: 'valuation', type: 'fundamental', defaultParams: {}, paramLabels: {}, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d'], description: 'Price to Earnings ratio' },
  { id: 'PB_RATIO', name: 'P/B Ratio', category: 'valuation', type: 'fundamental', defaultParams: {}, paramLabels: {}, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d'], description: 'Price to Book ratio' },
  { id: 'DIVIDEND_YIELD', name: 'Dividend Yield', category: 'valuation', type: 'fundamental', defaultParams: {}, paramLabels: {}, supportedOperators: ['<', '>', '>='], supportedTimeframes: ['1d'], description: 'Annual dividend yield %' },
  { id: 'EV_EBITDA', name: 'EV/EBITDA', category: 'valuation', type: 'fundamental', defaultParams: {}, paramLabels: {}, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d'], description: 'Enterprise Value to EBITDA' },

  // Price Action
  { id: 'PRICE', name: 'Price', category: 'relative', type: 'price_action', defaultParams: {}, paramLabels: {}, supportedOperators: ['<', '>', '<=', '>=', '==', 'crosses_above', 'crosses_below', 'between'], supportedTimeframes: ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M'], description: 'Current price' },
  { id: 'PRICE_CHANGE_PCT', name: 'Price Change %', category: 'relative', type: 'price_action', defaultParams: { period: 1 }, paramLabels: { period: 'Days' }, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d'], description: 'Percentage price change over N days' },
  { id: 'DISTANCE_52W_HIGH', name: 'Dist. from 52w High', category: 'relative', type: 'price_action', defaultParams: {}, paramLabels: {}, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d'], description: 'Distance from 52-week high in %' },
  { id: 'DISTANCE_52W_LOW', name: 'Dist. from 52w Low', category: 'relative', type: 'price_action', defaultParams: {}, paramLabels: {}, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d'], description: 'Distance from 52-week low in %' },
  { id: 'GAP_PCT', name: 'Gap %', category: 'gaps', type: 'price_action', defaultParams: {}, paramLabels: {}, supportedOperators: ['<', '>', 'between'], supportedTimeframes: ['1d'], description: 'Opening gap percentage' },

  // Sentiment — auto-registered from sentiment indicator registry
  ...getSentimentIndicatorsForScanner(),
];

const CATEGORIES = [
  { id: 'momentum', label: 'Momentum' },
  { id: 'trend', label: 'Trend' },
  { id: 'volatility', label: 'Volatility' },
  { id: 'volume', label: 'Volume' },
  { id: 'valuation', label: 'Fundamental' },
  { id: 'relative', label: 'Price Action' },
  { id: 'gaps', label: 'Gaps' },
  // Sentiment categories
  { id: 'news', label: 'Sentiment: News' },
  { id: 'social', label: 'Sentiment: Social' },
  { id: 'institutional', label: 'Sentiment: Institutional' },
  { id: 'earnings', label: 'Sentiment: Earnings' },
  { id: 'event', label: 'Sentiment: Events' },
  { id: 'composite', label: 'Sentiment: Composite' },
];

interface IndicatorSelectorProps {
  value: string;
  onChange: (indicatorId: string) => void;
}

export function IndicatorSelector({ value, onChange }: IndicatorSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentDef = INDICATOR_CATALOG.find((ind) => ind.id === value);
  const filtered = search
    ? INDICATOR_CATALOG.filter((ind) => ind.name.toLowerCase().includes(search.toLowerCase()) || ind.id.toLowerCase().includes(search.toLowerCase()))
    : INDICATOR_CATALOG;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '4px 8px',
          fontSize: 12,
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: 4,
          color: '#58a6ff',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {currentDef?.name ?? value} &#9662;
      </button>
      {open && (
        <div className="sc-indicator-dropdown">
          <div style={{ padding: 8 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search indicators..."
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: 12,
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: 4,
                color: '#e6edf3',
              }}
              autoFocus
            />
          </div>
          {CATEGORIES.map((cat) => {
            const items = filtered.filter((ind) => ind.category === cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="sc-indicator-group-label">{cat.label}</div>
                {items.map((ind) => (
                  <div
                    key={ind.id}
                    className="sc-indicator-option"
                    onClick={() => { onChange(ind.id); setOpen(false); setSearch(''); }}
                  >
                    {ind.name}
                    <span style={{ color: '#8b949e', marginLeft: 8, fontSize: 11 }}>
                      {ind.description}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
