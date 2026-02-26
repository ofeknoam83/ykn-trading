import { useState } from 'react';
import type { WorkflowValidationError } from '../../../types/workflow';

interface WorkflowValidationBannerProps {
  errors: WorkflowValidationError[];
  onStepClick: (stepId: string) => void;
}

export function WorkflowValidationBanner({ errors, onStepClick }: WorkflowValidationBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (errors.length === 0) return null;

  const errorCount = errors.filter(e => e.level === 'error').length;
  const warningCount = errors.filter(e => e.level === 'warning').length;
  const hasBlockingErrors = errorCount > 0;

  return (
    <div
      className={`wf-validation-banner ${hasBlockingErrors ? 'wf-validation-error' : 'wf-validation-warning'}`}
      role="alert"
      aria-live="polite"
    >
      <div className="wf-validation-summary" onClick={() => setExpanded(!expanded)}>
        <span className="wf-validation-icon">{hasBlockingErrors ? '!' : '\u26A0'}</span>
        <span>
          {errorCount > 0 && `${errorCount} error${errorCount !== 1 ? 's' : ''}`}
          {errorCount > 0 && warningCount > 0 && ', '}
          {warningCount > 0 && `${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
          {hasBlockingErrors ? '. Fix before saving.' : '. Review recommended.'}
        </span>
        <button className="wf-validation-toggle">{expanded ? '\u25B2' : '\u25BC'}</button>
      </div>

      {expanded && (
        <ul className="wf-validation-list">
          {errors.map((err, i) => (
            <li
              key={i}
              className={`wf-validation-item wf-validation-${err.level}`}
              onClick={() => err.step_id && onStepClick(err.step_id)}
              style={{ cursor: err.step_id ? 'pointer' : 'default' }}
            >
              <span className="wf-validation-level">{err.level === 'error' ? 'ERR' : 'WARN'}</span>
              {err.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
