import type { WhatIfScenario } from '../../../types/forensics';

interface WhatIfHistoryProps {
  history: WhatIfScenario[];
  onLoad: (scenario: WhatIfScenario) => void;
  onClear: () => void;
}

export function WhatIfHistory({ history, onLoad, onClear }: WhatIfHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="tf-whatif-history">
      <div className="tf-history-header">
        <h5>What-If History ({history.length})</h5>
        <button className="bt-btn bt-btn-secondary" onClick={onClear}>
          Clear
        </button>
      </div>

      <div className="tf-history-list">
        {history.map((scenario) => {
          const { result } = scenario;
          const isWinner = result.comparison.verdict === 'better';
          const isWorse = result.comparison.verdict === 'worse';

          return (
            <div key={scenario.id} className="tf-history-item">
              <div className="tf-history-label">{scenario.label}</div>
              <div className="tf-history-result">
                <span
                  className={`mono ${
                    isWinner
                      ? 'bt-metric-positive'
                      : isWorse
                        ? 'bt-metric-negative'
                        : ''
                  }`}
                >
                  {result.modified.pnl >= 0 ? '+' : ''}$
                  {result.modified.pnl.toFixed(0)} (
                  {(result.modified.pnl_pct * 100).toFixed(1)}%)
                </span>
              </div>
              <button className="bt-action-btn" onClick={() => onLoad(scenario)}>
                Load
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
