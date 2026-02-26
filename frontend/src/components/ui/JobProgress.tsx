import { useEffect, useRef } from 'react';
import { useJob } from '../../hooks/useJobs';

interface JobProgressProps {
  jobId: string | null;
  pollInterval?: number;
  onComplete?: (result: unknown) => void;
  onFailed?: (error: string) => void;
  children?: (state: ReturnType<typeof useJob>) => React.ReactNode;
}

export function JobProgress({ jobId, pollInterval = 1500, onComplete, onFailed, children }: JobProgressProps) {
  const state = useJob(jobId, pollInterval);
  const completedRef = useRef(false);
  const failedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    failedRef.current = false;
  }, [jobId]);

  useEffect(() => {
    if (state.status === 'completed' && state.result != null && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(state.result);
    }
  }, [state.status, state.result, onComplete]);

  useEffect(() => {
    if (state.status === 'failed' && state.error && !failedRef.current) {
      failedRef.current = true;
      onFailed?.(state.error);
    }
  }, [state.status, state.error, onFailed]);

  if (children) {
    return <>{children(state)}</>;
  }

  if (!jobId || (state.status !== 'pending' && state.status !== 'running')) {
    return null;
  }

  return (
    <div className="job-progress" role="status" aria-label="Job in progress">
      <div className="job-progress-bar">
        <div
          className="job-progress-fill"
          style={{ width: `${state.progress}%` }}
        />
      </div>
      <div className="job-progress-text">
        {state.status === 'running' && state.eta_seconds != null
          ? `~${Math.ceil(state.eta_seconds / 60)} min remaining`
          : 'Processing...'}
      </div>
    </div>
  );
}
