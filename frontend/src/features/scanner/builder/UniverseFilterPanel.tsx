import type { UniverseFilter, AssetClass } from '../types/scanner.types';

interface UniverseFilterPanelProps {
  universe: UniverseFilter;
  onChange: (universe: UniverseFilter) => void;
}

const ASSET_CLASSES: { value: AssetClass; label: string }[] = [
  { value: 'us_equity', label: 'US Equities' },
  { value: 'etf', label: 'ETFs' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'forex', label: 'Forex' },
  { value: 'futures', label: 'Futures' },
  { value: 'options', label: 'Options' },
];

const MARKET_CAP_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 1e8, label: '$100M+' },
  { value: 5e8, label: '$500M+' },
  { value: 1e9, label: '$1B+' },
  { value: 1e10, label: '$10B+' },
  { value: 5e10, label: '$50B+' },
  { value: 2e11, label: '$200B+' },
];

const SECTORS = [
  'Any', 'Technology', 'Healthcare', 'Financials', 'Energy',
  'Consumer Discretionary', 'Industrials', 'Utilities',
  'Materials', 'Real Estate', 'Communication Services', 'Consumer Staples',
];

const INDEX_OPTIONS = ['Any', 'SP500', 'NASDAQ100', 'RUSSELL2000', 'DOW30'];

export function UniverseFilterPanel({ universe, onChange }: UniverseFilterPanelProps) {
  const update = (patch: Partial<UniverseFilter>) => onChange({ ...universe, ...patch });

  return (
    <div className="sc-builder-section">
      <label className="sc-builder-section-title">Universe</label>
      <div className="sc-universe-filters">
        <div className="sc-filter-row">
          <span className="sc-filter-label">Asset Class</span>
          <select
            value={universe.assetClass[0] ?? 'us_equity'}
            onChange={(e) => update({ assetClass: [e.target.value as AssetClass] })}
          >
            {ASSET_CLASSES.map((ac) => (
              <option key={ac.value} value={ac.value}>{ac.label}</option>
            ))}
          </select>
        </div>

        <div className="sc-filter-row">
          <span className="sc-filter-label">Market Cap</span>
          <select
            value={universe.marketCapMin ?? 0}
            onChange={(e) => update({ marketCapMin: Number(e.target.value) || undefined })}
          >
            {MARKET_CAP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="sc-filter-row">
          <span className="sc-filter-label">Sector</span>
          <select
            value={universe.sector?.[0] ?? 'Any'}
            onChange={(e) => update({ sector: e.target.value === 'Any' ? undefined : [e.target.value] })}
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="sc-filter-row">
          <span className="sc-filter-label">Index</span>
          <select
            value={universe.indexMembership?.[0] ?? 'Any'}
            onChange={(e) => update({ indexMembership: e.target.value === 'Any' ? undefined : [e.target.value] })}
          >
            {INDEX_OPTIONS.map((idx) => (
              <option key={idx} value={idx}>{idx}</option>
            ))}
          </select>
        </div>

        <div className="sc-filter-row">
          <span className="sc-filter-label">Min Price</span>
          <input
            type="number"
            value={universe.priceMin ?? ''}
            onChange={(e) => update({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="0"
            style={{ width: 80 }}
          />
          <span className="sc-filter-label" style={{ minWidth: 'auto' }}>Max</span>
          <input
            type="number"
            value={universe.priceMax ?? ''}
            onChange={(e) => update({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Any"
            style={{ width: 80 }}
          />
        </div>

        <div className="sc-filter-row">
          <span className="sc-filter-label">Min Avg Vol</span>
          <input
            type="number"
            value={universe.avgVolumeMin ?? ''}
            onChange={(e) => update({ avgVolumeMin: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Any"
            style={{ width: 120 }}
          />
        </div>
      </div>
    </div>
  );
}
