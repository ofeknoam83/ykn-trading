import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { STEP_TYPE_REGISTRY } from './stepTypeRegistry';
import type { StepNodeData } from './workflowToReactFlow';
import type { ConditionConfig, WorkflowValidationError } from '../../../types/workflow';

interface ConditionStepNodeProps extends NodeProps {
  data: StepNodeData & { validationErrors?: WorkflowValidationError[] };
}

export const ConditionStepNode = memo(function ConditionStepNode({ data, selected }: ConditionStepNodeProps) {
  const { step, isEntry, validationErrors } = data;
  const def = STEP_TYPE_REGISTRY[step.type];
  const condConfig = step.config as ConditionConfig;
  const hasErrors = validationErrors && validationErrors.length > 0;

  return (
    <div
      className={`wf-node wf-node-condition ${selected ? 'wf-node-selected' : ''} ${isEntry ? 'wf-node-entry' : ''} ${hasErrors ? 'wf-node-error' : ''}`}
      style={{ borderColor: def.borderColor }}
    >
      <Handle type="target" position={Position.Top} className="wf-handle" />

      {isEntry && <div className="wf-node-start-badge">START</div>}

      <div className="wf-node-content">
        <div className="wf-node-header">
          <span className="wf-node-icon">{def.icon}</span>
          <span className="wf-node-label">{step.label}</span>
        </div>
        <div className="wf-node-summary">{def.summaryFn(step.config)}</div>
      </div>

      {hasErrors && (
        <div className="wf-node-error-badge" title={validationErrors!.map(e => e.message).join('\n')}>!</div>
      )}

      <div className="wf-condition-handles">
        <div className="wf-condition-branch wf-condition-true">
          <Handle type="source" position={Position.Bottom} id="true" className="wf-handle wf-handle-true" style={{ left: '30%' }} />
          <span className="wf-branch-label wf-branch-true">{condConfig.true_label || 'Yes'}</span>
        </div>
        <div className="wf-condition-branch wf-condition-false">
          <Handle type="source" position={Position.Bottom} id="false" className="wf-handle wf-handle-false" style={{ left: '70%' }} />
          <span className="wf-branch-label wf-branch-false">{condConfig.false_label || 'No'}</span>
        </div>
      </div>
    </div>
  );
});
