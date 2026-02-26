interface MonteCarloConfigProps {
  method: 'trade_resample' | 'return_shuffle' | 'block_bootstrap';
  onMethodChange: (m: 'trade_resample' | 'return_shuffle' | 'block_bootstrap') => void;
  simulations: number;
  onSimulationsChange: (n: number) => void;
  confidence: number;
  onConfidenceChange: (c: number) => void;
  blockSize: number;
  onBlockSizeChange: (b: number) => void;
  onRun: () => void;
  running: boolean;
}

const METHODS = [
  { value: 'trade_resample' as const, label: 'Trade Resampling', desc: 'Randomly reorders trades. Shows path dependency.' },
  { value: 'return_shuffle' as const, label: 'Return Shuffling', desc: 'Shuffles daily returns. Breaks temporal structure.' },
  { value: 'block_bootstrap' as const, label: 'Block Bootstrap', desc: 'Resamples blocks of consecutive days. Most realistic.' },
];

export function MonteCarloConfig({
  method,
  onMethodChange,
  simulations,
  onSimulationsChange,
  confidence,
  onConfidenceChange,
  blockSize,
  onBlockSizeChange,
  onRun,
  running,
}: MonteCarloConfigProps) {
  return (
    <div className="bt-mc-config">
      <h4 className="bt-config-section-title">Monte Carlo Configuration</h4>

      <div className="bt-config-section">
        <label className="bt-config-label">Method</label>
        <div className="bt-method-cards">
          {METHODS.map((m) => (
            <label
              key={m.value}
              className={`bt-method-card ${method === m.value ? 'bt-method-card-active' : ''}`}
            >
              <input
                type="radio"
                name="mc-method"
                checked={method === m.value}
                onChange={() => onMethodChange(m.value)}
              />
              <span className="bt-method-label">{m.label}</span>
              <span className="bt-method-desc">{m.desc}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bt-config-section">
        <label className="bt-config-label">Simulations</label>
        <input
          type="number"
          className="bt-input bt-input-sm"
          value={simulations}
          min={100}
          max={10000}
          step={100}
          onChange={(e) => onSimulationsChange(Number(e.target.value) || 1000)}
        />
      </div>

      <div className="bt-config-section">
        <label className="bt-config-label">Confidence Level</label>
        <select
          className="bt-select"
          value={confidence}
          onChange={(e) => onConfidenceChange(Number(e.target.value))}
        >
          <option value={0.9}>90%</option>
          <option value={0.95}>95%</option>
          <option value={0.99}>99%</option>
        </select>
      </div>

      {method === 'block_bootstrap' && (
        <div className="bt-config-section">
          <label className="bt-config-label">Block Size (days)</label>
          <input
            type="number"
            className="bt-input bt-input-sm"
            value={blockSize}
            min={5}
            max={60}
            onChange={(e) => onBlockSizeChange(Number(e.target.value) || 20)}
          />
        </div>
      )}

      <button
        className="bt-btn bt-btn-primary"
        onClick={onRun}
        disabled={running}
      >
        {running ? 'Running...' : 'Run Monte Carlo'}
      </button>
    </div>
  );
}
