import { useState, useEffect, useCallback } from 'react';
import type {
  BacktestConfig,
  OptimizationParameter,
  OptimizerResult,
  OptimizerGridCell,
  BacktestResult,
} from '../../../types/backtest';

import { runOptimizer, getBacktestResult, parseOptimizerResult } from '../../../api/backtestApi';
import { useJob } from '../../../hooks/useJobs';
import { WorkbenchConfigPanel } from '../workbench/WorkbenchConfigPanel';
import { OptimizerConfig } from './OptimizerConfig';
import { HeatmapChart } from './HeatmapChart';
import { BarChart1D } from './BarChart1D';
import { TopNTable } from './TopNTable';
import { OverfitWarning } from './OverfitWarning';
import { ResultsAnalyticsSuite } from '../analytics/ResultsAnalyticsSuite';

interface ParameterOptimizerProps {
  onCompare?: (result: BacktestResult) => void;
  onPin?: (result: BacktestResult) => void;
}

export function ParameterOptimizer({ onCompare, onPin }: ParameterOptimizerProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [targetMetric, setTargetMetric] = useState('sharpe_ratio');
  const [parameters, setParameters] = useState<OptimizationParameter[]>([]);
  const [optimizerResult, setOptimizerResult] = useState<OptimizerResult | null>(null);
  const [selectedCell, setSelectedCell] = useState<BacktestResult | null>(null);
  const [partialResults, setPartialResults] = useState<OptimizerGridCell[]>([]);
  const jobState = useJob(jobId);

  const handleRun = useCallback(async (config: BacktestConfig) => {
    if (parameters.length === 0) return;
    try {
      const { job_id } = await runOptimizer({
        strategy_id: config.strategy_id,
        strategy_config_overrides: config.strategy_config,
        assets: config.assets,
        date_range: config.date_range,
        interval: config.interval,
        benchmark: config.benchmark,
        fees: config.fees,
        optimization: {
          target_metric: targetMetric,
          parameters,
        },
      });
      setJobId(job_id);
      setOptimizerResult(null);
      setSelectedCell(null);
      setPartialResults([]);
    } catch { /* error via job system */ }
  }, [parameters, targetMetric]);

  useEffect(() => {
    if (jobState.status === 'running' && jobState.result) {
      const partial = jobState.result as { partial_results?: OptimizerGridCell[] };
      if (partial.partial_results) {
        setPartialResults(partial.partial_results);
      }
    }
    if (jobState.status === 'completed' && jobState.result) {
      setOptimizerResult(parseOptimizerResult(jobState.result));
      setJobId(null);
    }
    if (jobState.status === 'failed') {
      setJobId(null);
    }
  }, [jobState.status, jobState.result]);

  const handleCellClick = useCallback(async (cell: OptimizerGridCell) => {
    try {
      const result = await getBacktestResult(cell.result_id);
      setSelectedCell(result);
    } catch { /* fallback */ }
  }, []);

  const isRunning = jobState.status === 'running' || jobState.status === 'pending';
  const totalCombinations = computeCombinations(parameters);

  return (
    <div className="bt-optimizer">
      <div className="bt-optimizer-left">
        <WorkbenchConfigPanel onRun={handleRun} running={isRunning}>
          <div className="bt-config-divider" />
          <OptimizerConfig
            targetMetric={targetMetric}
            onTargetMetricChange={setTargetMetric}
            parameters={parameters}
            onParametersChange={setParameters}
          />
          {totalCombinations > 0 && (
            <div className="bt-combo-count">
              <span>Total combinations: <strong>{totalCombinations}</strong></span>
              {totalCombinations > 200 && (
                <span className="bt-warning-text">
                  {totalCombinations > 500
                    ? 'Maximum 500 combinations. Reduce ranges.'
                    : `${totalCombinations}+ backtests. This may take a while.`}
                </span>
              )}
            </div>
          )}
        </WorkbenchConfigPanel>

        {isRunning && (
          <div className="bt-job-inline">
            <div className="bt-job-bar">
              <div className="bt-job-fill" style={{ width: `${jobState.progress}%` }} />
            </div>
            <span className="bt-job-text">
              {jobState.progress}% — Optimizing...
            </span>
          </div>
        )}
      </div>

      <div className="bt-optimizer-right">
        {(optimizerResult || partialResults.length > 0) && (
          <div className="bt-optimizer-results">
            {parameters.length === 1 && (
              <BarChart1D
                parameter={parameters[0]}
                cells={optimizerResult?.grid ?? partialResults}
                targetMetric={targetMetric}
                onCellClick={handleCellClick}
              />
            )}
            {parameters.length >= 2 && (
              <HeatmapChart
                parameters={parameters}
                cells={optimizerResult?.grid ?? partialResults}
                targetMetric={targetMetric}
                onCellClick={handleCellClick}
              />
            )}

            {optimizerResult && (
              <>
                <TopNTable
                  cells={optimizerResult.top_n}
                  parameters={optimizerResult.parameters}
                  targetMetric={targetMetric}
                  onCellClick={handleCellClick}
                  onCompare={onCompare}
                  onPin={onPin}
                />
                <OverfitWarning combinationsCount={optimizerResult.total_combinations} />
              </>
            )}
          </div>
        )}

        {selectedCell && (
          <div className="bt-optimizer-detail">
            <h4>Selected Configuration Result</h4>
            <ResultsAnalyticsSuite result={selectedCell} compact />
          </div>
        )}

        {!optimizerResult && partialResults.length === 0 && !isRunning && (
          <div className="bt-empty-workbench">
            <h3>Parameter Optimizer</h3>
            <p>Add parameters to sweep, select a target metric, and run to find optimal configurations.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function computeCombinations(params: OptimizationParameter[]): number {
  if (params.length === 0) return 0;
  return params.reduce((total, p) => {
    if (p.type === 'range' && p.from != null && p.to != null && p.step) {
      return total * Math.floor((p.to - p.from) / p.step + 1);
    }
    if (p.type === 'enum' && p.values) {
      return total * p.values.length;
    }
    return total;
  }, 1);
}
