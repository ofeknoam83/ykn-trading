import { useState } from 'react';
import type { BacktestResult } from '../../../types/backtest';
import { OverlaidEquityCurves } from './OverlaidEquityCurves';
import { ComparisonMetricsTable } from './ComparisonMetricsTable';
import { DrawdownComparison } from './DrawdownComparison';
import { StrategyCorrelation } from './StrategyCorrelation';

interface ComparisonLabProps {
  results: BacktestResult[];
  onRemove: (resultId: string) => void;
}

type CompView = 'equity' | 'metrics' | 'drawdowns' | 'correlation';

export function ComparisonLab({ results, onRemove }: ComparisonLabProps) {
  const [view, setView] = useState<CompView>('equity');

  if (results.length < 2) {
    return (
      <div className="bt-comparison-lab">
        <div className="bt-empty-workbench">
          <h3>Comparison Lab</h3>
          <p>Add at least 2 backtest results to compare them side by side.</p>
          <p className="bt-empty-hint">
            Use the "Compare" button on any backtest result from the Workbench,
            Optimizer, or Library to add it here.
          </p>
          {results.length === 1 && (
            <div className="bt-comparison-pending">
              <span>1 result added: <strong>{results[0].name}</strong></span>
              <span className="bt-hint"> — add at least one more to compare</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const COLORS = ['#58a6ff', '#3fb950', '#d29922', '#f85149', '#6e40c9', '#f778ba', '#79c0ff', '#7ee787', '#e3b341', '#ff7b72'];

  return (
    <div className="bt-comparison-lab">
      <div className="bt-comparison-header">
        <h3>Comparing {results.length} Results</h3>
        <div className="bt-comparison-chips">
          {results.map((r, i) => (
            <span key={r.id} className="bt-comp-chip" style={{ borderColor: COLORS[i % COLORS.length] }}>
              <span className="bt-comp-dot" style={{ background: COLORS[i % COLORS.length] }} />
              {r.name}
              <button className="bt-chip-remove" onClick={() => onRemove(r.id)}>\u00D7</button>
            </span>
          ))}
        </div>
      </div>

      <div className="bt-analytics-tabs">
        <button className={`bt-analytics-tab ${view === 'equity' ? 'bt-analytics-tab-active' : ''}`} onClick={() => setView('equity')}>
          Equity Curves
        </button>
        <button className={`bt-analytics-tab ${view === 'metrics' ? 'bt-analytics-tab-active' : ''}`} onClick={() => setView('metrics')}>
          Metrics
        </button>
        <button className={`bt-analytics-tab ${view === 'drawdowns' ? 'bt-analytics-tab-active' : ''}`} onClick={() => setView('drawdowns')}>
          Drawdowns
        </button>
        {results.length >= 3 && (
          <button className={`bt-analytics-tab ${view === 'correlation' ? 'bt-analytics-tab-active' : ''}`} onClick={() => setView('correlation')}>
            Correlation
          </button>
        )}
      </div>

      <div className="bt-comparison-content">
        {view === 'equity' && <OverlaidEquityCurves results={results} colors={COLORS} />}
        {view === 'metrics' && <ComparisonMetricsTable results={results} />}
        {view === 'drawdowns' && <DrawdownComparison results={results} colors={COLORS} />}
        {view === 'correlation' && <StrategyCorrelation results={results} />}
      </div>
    </div>
  );
}
