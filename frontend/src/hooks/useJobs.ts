import { useEffect, useState } from 'react';
import { getJob } from '../api/client';

export interface JobState {
  id: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  eta_seconds: number | null;
  result: unknown;
  error: string | null;
}

/** When jobId is null, reset to idle so isRunning is false */
const IDLE_STATE: JobState = {
  id: null,
  status: 'completed',
  progress: 0,
  eta_seconds: null,
  result: null,
  error: null,
};

export function useJob(jobId: string | null, pollInterval = 1500) {
  const [state, setState] = useState<JobState>(IDLE_STATE);

  useEffect(() => {
    if (!jobId) {
      setState(IDLE_STATE);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const job = await getJob(jobId);
        if (cancelled) return;
        setState({
          id: job.id,
          status: job.status,
          progress: job.progress ?? 0,
          eta_seconds: job.eta_seconds ?? null,
          result: job.result ?? null,
          error: job.error ?? null,
        });
        if (job.status === 'pending' || job.status === 'running') {
          setTimeout(poll, pollInterval);
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, status: 'failed', error: 'Failed to fetch job status' }));
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [jobId, pollInterval]);

  return state;
}
