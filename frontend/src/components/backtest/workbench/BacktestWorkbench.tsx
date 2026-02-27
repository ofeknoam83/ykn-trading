import { useState, useCallback, useEffect } from 'react';
import type { BacktestConfig, BacktestResult } from '../../../types/backtest';
import { runBacktestEnhanced, getBacktestResult, normalizeJobResult } from '../../../api/backtestApi';
import { useJob } from '../../../hooks/useJobs';
import { WorkbenchConfigPanel } from './WorkbenchConfigPanel';
import { ResultCard } from './ResultCard';
import { ResultsAnalyticsSuite } from '../analytics/ResultsAnalyticsSuite';

interface BacktestWorkbenchProps {
  pinnedResults: BacktestResult[];
  recentResults: BacktestResult[];
  activeResult: BacktestResult | null;
  onAddResult: (result: BacktestResult) => void;
  onPin: (result: BacktestResult) => void;
  onUnpin: (resultId: string) => void;
  onCompare: (result: BacktestResult) => void;
  onSave: (result: BacktestResult) => void;
  onSelectResult: (result: BacktestResult) => void;
}

export function BacktestWorkbench({
  pinnedResults,
  recentResults,
  activeResult,
  onAddResult,
  onPin,
  onUnpin,
  onCompare,
  onSave,
  onSelectResult,
}: BacktestWorkbenchProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const jobState = useJob(jobId);

  const handleRun = useCallback(async (config: BacktestConfig) => {
    setRunError(null);
    try {
      const { job_id } = await runBacktestEnhanced(config);
      setJobId(job_id);
    } catch (e: unknown) {
      let msg = 'Failed to start backtest';
      if (e && typeof e === 'object' && 'response' in e) {
        const res = (e as { response?: { data?: unknown; status?: number } }).response;
        if (res?.status === 422) msg = 'Invalid config (check date format and required fields)';
        else if (res?.data && typeof res.data === 'object' && 'detail' in res.data) {
          const d = String((res.data as { detail: unknown }).detail);
          msg = d.length > 120 ? 'Validation error' : d;
        }
      } else if (e instanceof Error) msg = e.message;
      setRunError(msg);
    }
  }, []);

  useEffect(() => {
    if (jobState.status === 'completed' && jobState.result && jobId) {
      setRunError(null);
      const resultData = jobState.result as { result_id?: string; symbol?: string; metrics?: Record<string, number>; equity_curve?: Record<string, number>; trades_count?: number };
      if (resultData.result_id) {
        getBacktestResult(resultData.result_id).then((result) => {
          onAddResult(result);
          setJobId(null);
        }).catch(() => setJobId(null));
      } else {
        onAddResult(normalizeJobResult(resultData, jobId));
        setJobId(null);
      }
    }
    if (jobState.status === 'failed') {
      setRunError(jobState.error ?? 'Backtest failed');
      setJobId(null);
    }
  }, [jobState.status, jobState.result, jobState.error, jobId, onAddResult]);

  const isRunning = jobState.status === 'running' || jobState.status === 'pending';

  return (
    <div className="bt-workbench">
      <div className="bt-workbench-left">
        {runError && (
          <div className="bt-warning" style={{ marginBottom: '0.75rem' }}>
            {runError}
          </div>
        )}
        <WorkbenchConfigPanel onRun={handleRun} running={isRunning} />
        {isRunning && (
          <div className="bt-job-inline">
            <div className="bt-job-bar">
              <div className="bt-job-fill" style={{ width: `${jobState.progress}%` }} />
            </div>
            <span className="bt-job-text">
              {jobState.progress}%
              {jobState.eta_seconds != null && jobState.eta_seconds > 0 && (
                <> — ~{Math.ceil(jobState.eta_seconds / 60)} min</>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="bt-workbench-right">
        {pinnedResults.length > 0 && (
          <div className="bt-pinned-section">
            <h4 className="bt-section-title">Pinned Results</h4>
            {pinnedResults.map((r) => (
              <ResultCard
                key={r.id}
                result={r}
                isPinned
                isActive={activeResult?.id === r.id}
                onClick={() => onSelectResult(r)}
                onUnpin={() => onUnpin(r.id)}
                onCompare={() => onCompare(r)}
                onSave={() => onSave(r)}
              />
            ))}
          </div>
        )}

        {activeResult && (
          <div className="bt-active-section">
            <div className="bt-active-header">
              <h4 className="bt-section-title">Active Result</h4>
              <span className="bt-result-name-lg">{activeResult.name}</span>
            </div>
            <ResultsAnalyticsSuite
              result={activeResult}
              showRegime
              showMonteCarlo
            />
          </div>
        )}

        {!activeResult && !isRunning && pinnedResults.length === 0 && (
          <div className="bt-empty-workbench">
            <h3>Backtest Workbench</h3>
            <p>Configure your strategy on the left and click &quot;Run Backtest&quot; to see results here.</p>
            <p className="bt-empty-hint">
              Results accumulate in this workspace. Pin results to keep them across sessions,
              or compare multiple runs side by side.
            </p>
            <p className="bt-empty-hint" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
              Ensure the backend is running (cd backend && uvicorn app.main:app --reload) and dates are valid.
            </p>
          </div>
        )}

        {recentResults.length > 0 && activeResult && (
          <div className="bt-recent-section">
            <h4 className="bt-section-title">Recent Results</h4>
            {recentResults
              .filter((r) => r.id !== activeResult.id && !pinnedResults.some((p) => p.id === r.id))
              .map((r) => (
                <ResultCard
                  key={r.id}
                  result={r}
                  onClick={() => onSelectResult(r)}
                  onPin={() => onPin(r)}
                  onCompare={() => onCompare(r)}
                  onSave={() => onSave(r)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
