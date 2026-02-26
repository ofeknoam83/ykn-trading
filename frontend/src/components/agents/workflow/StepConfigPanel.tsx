import { useState, useEffect } from 'react';
import type { WorkflowStep, StepConfig } from '../../../types/workflow';
import { STEP_TYPE_REGISTRY } from './stepTypeRegistry';
import { DynamicForm } from '../../../lib/dynamic-form';

interface StepConfigPanelProps {
  step: WorkflowStep;
  onUpdate: (step: WorkflowStep) => void;
  onDelete: (stepId: string) => void;
  onClose: () => void;
}

export function StepConfigPanel({ step, onUpdate, onDelete, onClose }: StepConfigPanelProps) {
  const [label, setLabel] = useState(step.label);
  const def = STEP_TYPE_REGISTRY[step.type];

  useEffect(() => {
    setLabel(step.label);
  }, [step.id, step.label]);

  function handleDelete() {
    if (step.type === 'execute') {
      if (!confirm('This will remove trade execution from the workflow. Continue?')) return;
    }
    onDelete(step.id);
  }

  function handleSubmit(values: Record<string, unknown>) {
    onUpdate({ ...step, label, config: values as unknown as StepConfig });
  }

  return (
    <div className="step-config-panel" role="dialog" aria-label="Step configuration">
      <div className="scp-header">
        <button className="scp-back" onClick={onClose} aria-label="Close panel">&larr; Back</button>
        <span className="scp-title">Step Configuration</span>
      </div>

      <div className="scp-body">
        <label className="config-field">
          <span className="config-label">Label</span>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Step name"
          />
        </label>

        <div className="scp-type-display">
          <span className="config-label">Type</span>
          <span className="scp-type-badge">
            {def.icon} {def.label}
          </span>
        </div>

        <hr className="config-divider" />

        <h4 className="scp-section-title">Configuration</h4>
        <DynamicForm
          schema={def.fieldSchema}
          initialValues={step.config as unknown as Record<string, unknown>}
          onSubmit={handleSubmit}
          submitLabel="Apply"
          hideSubmit
          onChange={(values) => {
            // Live update: sync config as user edits
            onUpdate({ ...step, label, config: values as unknown as StepConfig });
          }}
        />
      </div>

      <div className="scp-footer">
        <button className="scp-delete-btn" onClick={handleDelete}>Delete Step</button>
        <button
          className="scp-apply-btn"
          onClick={() => onUpdate({ ...step, label, config: step.config })}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
