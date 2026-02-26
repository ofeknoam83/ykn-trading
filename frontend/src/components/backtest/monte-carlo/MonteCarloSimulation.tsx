import { useState, useEffect, useCallback } from 'react';
import type { MonteCarloResult } from '../../../types/backtest';
import { runMonteCarlo } from '../../../api/backtestApi';
import { useJob } from '../../../hooks/useJobs';
import { MonteCarloConfig } from './MonteCarloConfig';
import { FanChart } from './FanChart';
import { DistributionHistogram } from './DistributionHistogram';
import { MCSummaryTable } from './MCSummaryTable';
import { SignificanceAssessment } from './SignificanceAssessment';

interface MonteCarloSimulationProps {
  backtestResultId: string;
  onComplete?: (result: MonteCarloResult) => void;
}

export function MonteCarloSimulation({ backtestResultId, onComplete }: MonteCarloSimulationProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [method, setMethod] = useState<'trade_resample' | 'return_shuffle' | 'block_bootstrap'>('trade_resample');
  const [simulations, setSimulations] = useState(1000);
  const [confidence, setConfidence] = useState(0.95);
  const [blockSize, setBlockSize] = useState(20);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const jobState = useJob(jobId);

  const handleRun = useCallback(async () => {
    try {
      const { job_id } = await runMonteCarlo({
        backtest_result_id: backtestResultId,
        method,
        simulations,
        confidence_level: confidence,
        ...(method === 'block_bootstrap' ? { block_size: blockSize } : {}),
      });
      setJobId(job_id);
      setResult(null);
    } catch { /* */ }
  }, [backtestResultId, method, simulations, confidence, blockSize]);

  useEffect(() => {
    if (jobState.status === 'completed' && jobState.result) {
      const mc = jobState.result as MonteCarloResult;
      setResult(mc);
      setJobId(null);
      onComplete?.(mc);
    }
    if (jobState.status === 'failed') {
      setJobId(null);
    }
  }, [jobState.status, jobState.result, onComplete]);

  const isRunning = jobState.status === 'running' || jobState.status === 'pending';

  return (
    <div className="bt-montecarlo">
      <MonteCarloConfig
        method={method}
        onMethodChange={setMethod}
        simulations={simulations}
        onSimulationsChange={setSimulations}
        confidence={confidence}
        onConfidenceChange={setConfidence}
        blockSize={blockSize}
        onBlockSizeChange={setBlockSize}
        onRun={handleRun}
        running={isRunning}
      />

      {isRunning && (
        <div className="bt-job-inline">
          <div className="bt-job-bar">
            <div className="bt-job-fill" style={{ width: `${jobState.progress}%` }} />
          </div>
          <span className="bt-job-text">
            {jobState.progress}% — Simulating...
          </span>
        </div>
      )}

      {result && (
        <div className="bt-mc-full-results">
          <FanChart result={result} />
          <div className="bt-mc-histograms">
            <DistributionHistogram
              values={result.terminal_returns}
              label="Terminal Return Distribution"
              format="pct"
            />
            <DistributionHistogram
              values={result.max_drawdowns}
              label="Max Drawdown Distribution"
              format="pct"
              inverted
            />
          </div>
          <MCSummaryTable summary={result.summary} />
          <SignificanceAssessment result={result} />
        </div>
      )}
    </div>
  );
}
