import { useState, useEffect, useCallback } from 'react';
import type {
  BacktestConfig,
  OptimizationParameter,
  WalkForwardResult,
} from '../../../types/backtest';
import { runWalkForward, parseWalkForwardResult } from '../../../api/backtestApi';
import { useJob } from '../../../hooks/useJobs';
import { WorkbenchConfigPanel } from '../workbench/WorkbenchConfigPanel';
import { WalkForwardConfig } from './WalkForwardConfig';
import { CombinedOOSCurve } from './CombinedOOSCurve';
import { WindowMetricsTable } from './WindowMetricsTable';
import { ISOOSScatter } from './ISOOSScatter';
import { StabilityScore } from './StabilityScore';

export function WalkForwardAnalysis() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [windowType, setWindowType] = useState<'rolling' | 'expanding'>('rolling');
  const [isSampleDays, setIsSampleDays] = useState(252);
  const [oosSampleDays, setOosSampleDays] = useState(63);
  const [stepDays, setStepDays] = useState(63);
  const [reOptimize, setReOptimize] = useState(false);
  const [optParams, setOptParams] = useState<OptimizationParameter[]>([]);
  const [optTarget, setOptTarget] = useState('sharpe_ratio');
  const [result, setResult] = useState<WalkForwardResult | null>(null);
  const jobState = useJob(jobId);

  const handleRun = useCallback(async (config: BacktestConfig) => {
    try {
      const { job_id } = await runWalkForward({
        strategy_id: config.strategy_id,
        strategy_config: config.strategy_config,
        assets: config.assets,
        date_range: config.date_range,
        interval: config.interval,
        benchmark: config.benchmark,
        fees: config.fees,
        walk_forward: {
          window_type: windowType,
          in_sample_days: isSampleDays,
          out_of_sample_days: oosSampleDays,
          step_days: stepDays,
          re_optimize: reOptimize,
          ...(reOptimize ? {
            optimization_config: {
              target_metric: optTarget,
              parameters: optParams,
            }
          } : {}),
        },
      });
      setJobId(job_id);
      setResult(null);
    } catch { /* */ }
  }, [windowType, isSampleDays, oosSampleDays, stepDays, reOptimize, optParams, optTarget]);

  useEffect(() => {
    if (jobState.status === 'completed' && jobState.result) {
      setResult(parseWalkForwardResult(jobState.result));
      setJobId(null);
    }
    if (jobState.status === 'failed') {
      setJobId(null);
    }
  }, [jobState.status, jobState.result]);

  const isRunning = jobState.status === 'running' || jobState.status === 'pending';

  return (
    <div className="bt-walkforward">
      <div className="bt-walkforward-left">
        <WorkbenchConfigPanel onRun={handleRun} running={isRunning}>
          <div className="bt-config-divider" />
          <WalkForwardConfig
            windowType={windowType}
            onWindowTypeChange={setWindowType}
            isSampleDays={isSampleDays}
            onIsSampleDaysChange={setIsSampleDays}
            oosSampleDays={oosSampleDays}
            onOosSampleDaysChange={setOosSampleDays}
            stepDays={stepDays}
            onStepDaysChange={setStepDays}
            reOptimize={reOptimize}
            onReOptimizeChange={setReOptimize}
            optTarget={optTarget}
            onOptTargetChange={setOptTarget}
            optParams={optParams}
            onOptParamsChange={setOptParams}
          />
        </WorkbenchConfigPanel>

        {isRunning && (
          <div className="bt-job-inline">
            <div className="bt-job-bar">
              <div className="bt-job-fill" style={{ width: `${jobState.progress}%` }} />
            </div>
            <span className="bt-job-text">
              {jobState.progress}% — Walk-forward analysis...
            </span>
          </div>
        )}
      </div>

      <div className="bt-walkforward-right">
        {result && (
          <>
            <StabilityScore
              score={result.stability_score}
              components={result.stability_components}
            />
            <CombinedOOSCurve
              equityCurve={result.combined_oos_equity}
              windows={result.windows}
            />
            <WindowMetricsTable
              windows={result.windows}
              reOptimize={reOptimize}
            />
            <ISOOSScatter windows={result.windows} />
          </>
        )}

        {!result && !isRunning && (
          <div className="bt-empty-workbench">
            <h3>Walk-Forward Analysis</h3>
            <p>
              Test strategy robustness by rolling through time windows.
              Each window trains on in-sample data and tests on out-of-sample data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
