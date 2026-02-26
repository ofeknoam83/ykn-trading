import type { BacktestResult } from '../../../types/backtest';
import { RegimeOverlay } from '../regime/RegimeOverlay';
import { RegimePerformanceTable } from '../regime/RegimePerformanceTable';
import { RegimeTransitionTable } from '../regime/RegimeTransitionTable';

interface RegimeTabProps {
  result: BacktestResult;
}

export function RegimeTab({ result }: RegimeTabProps) {
  if (!result.regime_analysis) {
    return <div className="bt-empty">Regime analysis not available for this result</div>;
  }

  return (
    <div className="bt-regime-tab">
      <RegimeOverlay
        equityCurve={result.equity_curve}
        regimes={result.regime_analysis.regimes}
      />
      <RegimePerformanceTable
        performance={result.regime_analysis.regime_performance}
      />
      <RegimeTransitionTable
        transitions={result.regime_analysis.regime_transitions}
      />
    </div>
  );
}
