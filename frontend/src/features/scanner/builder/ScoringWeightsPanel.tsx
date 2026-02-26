import type { ScoringConfig } from '../types/scanner.types';

interface ScoringWeightsPanelProps {
  weights: ScoringConfig['weights'];
  onChange: (weights: ScoringConfig['weights']) => void;
}

const WEIGHT_LABELS: { key: keyof ScoringConfig['weights']; label: string }[] = [
  { key: 'signalStrength', label: 'Signal Strength' },
  { key: 'historicalHitRate', label: 'Historical Hit Rate' },
  { key: 'regimeCompatibility', label: 'Regime Compatibility' },
  { key: 'portfolioFit', label: 'Portfolio Fit' },
  { key: 'recency', label: 'Recency' },
];

const DEFAULT_WEIGHTS: ScoringConfig['weights'] = {
  signalStrength: 0.30,
  historicalHitRate: 0.25,
  regimeCompatibility: 0.20,
  portfolioFit: 0.15,
  recency: 0.10,
};

export function ScoringWeightsPanel({ weights, onChange }: ScoringWeightsPanelProps) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleChange = (key: keyof ScoringConfig['weights'], value: number) => {
    const newWeights = { ...weights, [key]: value };
    // Auto-normalize
    const newTotal = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (newTotal > 0 && Math.abs(newTotal - 1) > 0.01) {
      const scale = 1 / newTotal;
      for (const k of Object.keys(newWeights) as (keyof typeof newWeights)[]) {
        newWeights[k] = Math.round(newWeights[k] * scale * 100) / 100;
      }
    }
    onChange(newWeights);
  };

  const handleReset = () => onChange({ ...DEFAULT_WEIGHTS });

  return (
    <div className="sc-builder-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label className="sc-builder-section-title">Scoring Weights</label>
        <button
          onClick={handleReset}
          style={{ fontSize: 11, color: '#8b949e', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
      <div className="sc-weights">
        {WEIGHT_LABELS.map(({ key, label }) => (
          <div className="sc-weight-row" key={key}>
            <span className="sc-weight-label">{label}</span>
            <input
              type="range"
              className="sc-weight-slider"
              min="0"
              max="0.5"
              step="0.05"
              value={weights[key]}
              onChange={(e) => handleChange(key, Number(e.target.value))}
            />
            <span className="sc-weight-value">{weights[key].toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: total > 1.01 || total < 0.99 ? '#d29922' : '#8b949e' }}>
        Total: {total.toFixed(2)} {total > 1.01 || total < 0.99 ? '(auto-normalizes to 1.0)' : ''}
      </div>
    </div>
  );
}
