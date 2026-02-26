import { useState } from 'react';

interface PortfolioFiltersProps {
  onChange: (filters: PortfolioFilterState) => void;
}

export interface PortfolioFilterState {
  excludeHeld: boolean;
  underweightSectorsOnly: boolean;
  maxCorrelation: number | null;
  diversificationBoost: boolean;
}

export function PortfolioFilters({ onChange }: PortfolioFiltersProps) {
  const [filters, setFilters] = useState<PortfolioFilterState>({
    excludeHeld: false,
    underweightSectorsOnly: false,
    maxCorrelation: null,
    diversificationBoost: false,
  });

  const update = (patch: Partial<PortfolioFilterState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onChange(next);
  };

  return (
    <div className="sc-builder-section">
      <label className="sc-builder-section-title">Portfolio Filters</label>
      <div className="sc-portfolio-filters">
        <div className="sc-portfolio-filter">
          <label>
            <input type="checkbox" checked={filters.excludeHeld} onChange={(e) => update({ excludeHeld: e.target.checked })} />
            Exclude held assets
          </label>
        </div>
        <div className="sc-portfolio-filter">
          <label>
            <input type="checkbox" checked={filters.underweightSectorsOnly} onChange={(e) => update({ underweightSectorsOnly: e.target.checked })} />
            Underweight sectors only
          </label>
        </div>
        <div className="sc-portfolio-filter">
          <label>
            <input type="checkbox" checked={filters.maxCorrelation !== null} onChange={(e) => update({ maxCorrelation: e.target.checked ? 0.5 : null })} />
            Max correlation
          </label>
          {filters.maxCorrelation !== null && (
            <input
              type="number"
              value={filters.maxCorrelation}
              onChange={(e) => update({ maxCorrelation: Number(e.target.value) })}
              min={0}
              max={1}
              step={0.1}
              style={{ width: 50, padding: '2px 6px', fontSize: 12, background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3' }}
            />
          )}
        </div>
        <div className="sc-portfolio-filter">
          <label>
            <input type="checkbox" checked={filters.diversificationBoost} onChange={(e) => update({ diversificationBoost: e.target.checked })} />
            Diversification boost
          </label>
        </div>
      </div>
    </div>
  );
}
