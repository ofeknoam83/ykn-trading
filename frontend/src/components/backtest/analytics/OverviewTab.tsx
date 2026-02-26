import type { BacktestResult } from '../../../types/backtest';
import { EquityCurveChart } from '../shared/EquityCurveChart';
import { MetricsGrid } from '../shared/MetricsGrid';
import { MonthlyHeatmap } from '../shared/MonthlyHeatmap';

interface OverviewTabProps {
  result: BacktestResult;
  compact?: boolean;
}

export function OverviewTab({ result, compact }: OverviewTabProps) {
  return (
    <div className="bt-overview-tab">
      <EquityCurveChart
        data={result.equity_curve}
        height={compact ? 300 : 400}
        showBenchmark
        showDrawdown={!compact}
      />
      <MetricsGrid metrics={result.metrics} layout={compact ? '1x4' : '2x4'} />
      {!compact && <MonthlyHeatmap data={result.monthly_returns} />}
    </div>
  );
}
