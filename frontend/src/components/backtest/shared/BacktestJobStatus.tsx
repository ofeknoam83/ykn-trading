import { useJob } from '../../../hooks/useJobs';

interface BacktestJobStatusProps {
  jobId: string | null;
  onComplete?: (result: unknown) => void;
  onFailed?: (error: string) => void;
  label?: string;
}

export function BacktestJobStatus({ jobId, onComplete, onFailed, label }: BacktestJobStatusProps) {
  const state = useJob(jobId);

  // Trigger callbacks
  if (state.status === 'completed' && state.result != null && onComplete) {
    onComplete(state.result);
  }
  if (state.status === 'failed' && state.error && onFailed) {
    onFailed(state.error);
  }

  if (!jobId || (state.status !== 'pending' && state.status !== 'running')) {
    return null;
  }

  return (
    <div className="bt-job-status">
      <div className="bt-job-bar">
        <div className="bt-job-fill" style={{ width: `${state.progress}%` }} />
      </div>
      <div className="bt-job-info">
        <span className="bt-job-label">{label || 'Processing...'}</span>
        <span className="bt-job-pct">{state.progress}%</span>
        {state.eta_seconds != null && state.eta_seconds > 0 && (
          <span className="bt-job-eta">
            ~{state.eta_seconds >= 60 ? `${Math.ceil(state.eta_seconds / 60)} min` : `${state.eta_seconds}s`} remaining
          </span>
        )}
      </div>
    </div>
  );
}
