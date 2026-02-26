import type { PortfolioImpact } from '../types/scanner.types';

interface BetterFitSuggestionsProps {
  alternatives: PortfolioImpact['alternatives'];
  onSelect: (symbol: string) => void;
}

export function BetterFitSuggestions({ alternatives, onSelect }: BetterFitSuggestionsProps) {
  if (alternatives.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>
        Better Fit Alternatives
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {alternatives.map((alt) => (
          <div
            key={alt.symbol}
            className="sc-impact-alternative"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(alt.symbol)}
          >
            <span style={{ fontWeight: 600 }}>{alt.symbol}</span>
            <span style={{ color: '#8b949e', marginLeft: 8 }}>
              {alt.sector} &bull; Score {alt.score}
            </span>
            <div style={{ marginTop: 2, fontSize: 11, color: '#8b949e' }}>
              {alt.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
