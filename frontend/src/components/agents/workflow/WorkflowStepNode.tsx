import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { STEP_TYPE_REGISTRY } from './stepTypeRegistry';
import type { StepNodeData } from './workflowToReactFlow';
import type { WorkflowValidationError } from '../../../types/workflow';

interface WorkflowStepNodeProps extends NodeProps {
  data: StepNodeData & { validationErrors?: WorkflowValidationError[] };
}

export const WorkflowStepNode = memo(function WorkflowStepNode({ data, selected }: WorkflowStepNodeProps) {
  const { step, isEntry, validationErrors } = data;
  const def = STEP_TYPE_REGISTRY[step.type];
  const hasErrors = validationErrors && validationErrors.length > 0;

  return (
    <div
      className={`wf-node ${selected ? 'wf-node-selected' : ''} ${isEntry ? 'wf-node-entry' : ''} ${hasErrors ? 'wf-node-error' : ''}`}
      style={{ borderColor: def.borderColor }}
    >
      <Handle type="target" position={Position.Top} className="wf-handle" />

      {isEntry && <div className="wf-node-start-badge">START</div>}

      <div className="wf-node-content">
        <div className="wf-node-header">
          <span className="wf-node-icon">{def.icon}</span>
          <span className="wf-node-label">{step.label}</span>
        </div>
        <div className="wf-node-type">{def.label}</div>
        <div className="wf-node-summary">{def.summaryFn(step.config)}</div>
      </div>

      {hasErrors && (
        <div className="wf-node-error-badge" title={validationErrors!.map(e => e.message).join('\n')}>!</div>
      )}

      <Handle type="source" position={Position.Bottom} id="default" className="wf-handle" />
    </div>
  );
});
