import { useMemo } from 'react';
import type { BacktestResult } from '../../../types/backtest';
import type { TimingMetrics, TimingInsight } from '../../../types/forensics';
import { TimingScoreCards } from './TimingScoreCards';
import { TimingHistograms } from './TimingHistograms';
import { ReturnCaptureScatter } from './ReturnCaptureScatter';
import { MAEMFEAnalysis } from './MAEMFEAnalysis';
import { TimingTable } from './TimingTable';
import { TimingInsights } from './TimingInsights';

interface TimingAnalysisProps {
  result: BacktestResult;
  timingMetrics: TimingMetrics[] | null;
  timingInsights: TimingInsight[] | null;
  selectedTradeId: string | null;
  loading: boolean;
  error: string | null;
  onSelectTrade: (tradeId: string) => void;
}

export function TimingAnalysis({
  result,
  timingMetrics,
  timingInsights,
  selectedTradeId,
  loading,
  error,
  onSelectTrade,
}: TimingAnalysisProps) {
  // Compute aggregate stats
  const stats = useMemo(() => {
    if (!timingMetrics || timingMetrics.length === 0) return null;

    const entryEffs = timingMetrics.map((t) => t.entry_efficiency);
    const exitEffs = timingMetrics.map((t) => t.exit_efficiency);
    const overallEffs = timingMetrics.map((t) => t.overall_efficiency);
    const actualReturns = timingMetrics.map((t) => t.actual_return);
    const optimalReturns = timingMetrics.map((t) => t.optimal_return);
    const capturedPcts = timingMetrics.map((t) => t.captured_pct);
    const maes = timingMetrics.map((t) => t.max_adverse_excursion);
    const mfes = timingMetrics.map((t) => t.max_favorable_excursion);

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const median = (arr: number[]) => {
      const s = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    };
    const stddev = (arr: number[]) => {
      const m = avg(arr);
      return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
    };

    // Separate winners and losers for MAE/MFE
    const winners = timingMetrics.filter((t) => t.actual_return > 0);
    const losers = timingMetrics.filter((t) => t.actual_return <= 0);

    return {
      entryAvg: avg(entryEffs),
      entryMedian: median(entryEffs),
      entryStdDev: stddev(entryEffs),
      exitAvg: avg(exitEffs),
      exitMedian: median(exitEffs),
      exitStdDev: stddev(exitEffs),
      overallAvg: avg(overallEffs),
      actualReturnAvg: avg(actualReturns),
      optimalReturnAvg: avg(optimalReturns),
      capturedAvg: avg(capturedPcts),
      winnersAvgMAE: winners.length > 0 ? avg(winners.map((t) => t.max_adverse_excursion)) : 0,
      losersAvgMAE: losers.length > 0 ? avg(losers.map((t) => t.max_adverse_excursion)) : 0,
      winnersAvgMFE: winners.length > 0 ? avg(winners.map((t) => t.max_favorable_excursion)) : 0,
      losersAvgMFE: losers.length > 0 ? avg(losers.map((t) => t.max_favorable_excursion)) : 0,
      entryEfficiencies: entryEffs,
      exitEfficiencies: exitEffs,
      actualReturns,
      optimalReturns,
      maes,
      mfes,
    };
  }, [timingMetrics]);

  if (loading) {
    return (
      <div className="tf-timing">
        <div className="tf-loading">Loading timing analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tf-timing">
        <div className="tf-error">Failed to load timing analysis: {error}</div>
      </div>
    );
  }

  if (!timingMetrics || !stats) {
    return (
      <div className="tf-timing">
        <div className="tf-empty-state">No timing data available.</div>
      </div>
    );
  }

  return (
    <div className="tf-timing">
      <TimingScoreCards stats={stats} />

      <div className="tf-timing-charts">
        <TimingHistograms
          entryEfficiencies={stats.entryEfficiencies}
          exitEfficiencies={stats.exitEfficiencies}
        />

        <ReturnCaptureScatter
          metrics={timingMetrics}
          selectedTradeId={selectedTradeId}
          onSelectTrade={onSelectTrade}
        />

        <MAEMFEAnalysis
          metrics={timingMetrics}
          winnersAvgMAE={stats.winnersAvgMAE}
          losersAvgMAE={stats.losersAvgMAE}
          winnersAvgMFE={stats.winnersAvgMFE}
          actualReturnAvg={stats.actualReturnAvg}
          selectedTradeId={selectedTradeId}
          onSelectTrade={onSelectTrade}
        />
      </div>

      <TimingTable
        metrics={timingMetrics}
        trades={result.trades}
        selectedTradeId={selectedTradeId}
        onSelectTrade={onSelectTrade}
      />

      {timingInsights && timingInsights.length > 0 && (
        <TimingInsights insights={timingInsights} />
      )}
    </div>
  );
}
