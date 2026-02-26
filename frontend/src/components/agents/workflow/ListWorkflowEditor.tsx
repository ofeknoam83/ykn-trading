import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Workflow, WorkflowStep, WorkflowValidationError } from '../../../types/workflow';
import type { StepType } from '../../../types/workflow';
import { STEP_TYPE_REGISTRY } from './stepTypeRegistry';
import { recomputeEdgesForLinearOrder } from './workflowSync';
import { StepTypePicker } from './StepTypePicker';
import { getStepErrors } from './workflowValidation';
import type { ConditionConfig } from '../../../types/workflow';

interface ListWorkflowEditorProps {
  workflow: Workflow;
  onChange: (workflow: Workflow) => void;
  onStepSelect: (stepId: string | null) => void;
  onAddStep: (type: StepType) => void;
  validationErrors: WorkflowValidationError[];
}

interface SortableStepRowProps {
  step: WorkflowStep;
  index: number;
  isEntry: boolean;
  workflow: Workflow;
  onSelect: (stepId: string) => void;
  onDelete: (stepId: string) => void;
  errors: WorkflowValidationError[];
}

function SortableStepRow({ step, index, isEntry, workflow, onSelect, onDelete, errors }: SortableStepRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const def = STEP_TYPE_REGISTRY[step.type];
  const hasErrors = errors.length > 0;

  // Find outgoing edges for this step
  const outEdges = workflow.edges.filter(e => e.source_step_id === step.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`wf-list-row ${isEntry ? 'wf-list-row-entry' : ''} ${hasErrors ? 'wf-list-row-error' : ''}`}
    >
      <div className="wf-list-row-main" onClick={() => onSelect(step.id)}>
        <span className="wf-list-drag" {...attributes} {...listeners}>&#x2261;</span>
        <span className="wf-list-index">{index + 1}.</span>
        <span className="wf-list-icon">{def.icon}</span>
        <div className="wf-list-info">
          <div className="wf-list-label">
            {step.label}
            {isEntry && <span className="wf-list-entry-badge">START</span>}
          </div>
          <div className="wf-list-summary">{def.label} &middot; {def.summaryFn(step.config)}</div>
        </div>
        <div className="wf-list-actions">
          {hasErrors && (
            <span className="wf-list-error-badge" title={errors.map(e => e.message).join('\n')}>!</span>
          )}
          <button
            className="wf-list-config-btn"
            onClick={e => { e.stopPropagation(); onSelect(step.id); }}
            title="Configure"
          >
            &#x2699;&#xFE0F;
          </button>
          <button
            className="wf-list-delete-btn"
            onClick={e => {
              e.stopPropagation();
              if (step.type === 'execute') {
                if (!confirm('This will remove trade execution from the workflow. Continue?')) return;
              }
              onDelete(step.id);
            }}
            title="Delete"
          >
            &#x1F5D1;
          </button>
        </div>
      </div>

      {step.type === 'condition' && (
        <div className="wf-list-branches">
          {(() => {
            const condConfig = step.config as ConditionConfig;
            const trueEdge = outEdges.find(e => e.condition_branch === 'true');
            const falseEdge = outEdges.find(e => e.condition_branch === 'false');
            const trueTarget = trueEdge ? workflow.steps.find(s => s.id === trueEdge.target_step_id) : null;
            const falseTarget = falseEdge ? workflow.steps.find(s => s.id === falseEdge.target_step_id) : null;
            return (
              <>
                <div className="wf-list-branch wf-list-branch-true">
                  <span className="wf-list-branch-icon">&#x2705;</span>
                  <span>True ({condConfig.true_label || 'Yes'}) &rarr; {trueTarget?.label || 'Not connected'}</span>
                </div>
                <div className="wf-list-branch wf-list-branch-false">
                  <span className="wf-list-branch-icon">&#x274C;</span>
                  <span>False ({condConfig.false_label || 'No'}) &rarr; {falseTarget?.label || 'Not connected'}</span>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export function ListWorkflowEditor({
  workflow,
  onChange,
  onStepSelect,
  onAddStep,
  validationErrors,
}: ListWorkflowEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = workflow.steps.findIndex(s => s.id === active.id);
      const newIndex = workflow.steps.findIndex(s => s.id === over.id);

      const reorderedSteps = arrayMove(workflow.steps, oldIndex, newIndex);
      const newEdges = recomputeEdgesForLinearOrder(reorderedSteps, workflow.edges);

      onChange({
        ...workflow,
        steps: reorderedSteps,
        edges: newEdges,
        entry_step_id: reorderedSteps[0]?.id ?? '',
      });
    },
    [workflow, onChange]
  );

  const handleDelete = useCallback(
    (stepId: string) => {
      const remainingSteps = workflow.steps.filter(s => s.id !== stepId);
      const remainingEdges = workflow.edges.filter(
        e => e.source_step_id !== stepId && e.target_step_id !== stepId
      );

      let entryStepId = workflow.entry_step_id;
      if (entryStepId === stepId) {
        entryStepId = remainingSteps.length > 0 ? remainingSteps[0].id : '';
      }

      onChange({
        ...workflow,
        steps: remainingSteps,
        edges: remainingEdges,
        entry_step_id: entryStepId,
      });
    },
    [workflow, onChange]
  );

  return (
    <div className="wf-list-editor">
      {workflow.steps.length === 0 ? (
        <div className="wf-empty-state">
          <p>No steps yet. Add your first step to begin building the workflow.</p>
          <StepTypePicker onSelect={onAddStep} buttonLabel="+ Add First Step" />
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={workflow.steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="wf-list-steps" role="list">
              {workflow.steps.map((step, index) => {
                const showArrow = index < workflow.steps.length - 1 && step.type !== 'condition';
                return (
                  <div key={step.id} role="listitem">
                    <SortableStepRow
                      step={step}
                      index={index}
                      isEntry={step.id === workflow.entry_step_id}
                      workflow={workflow}
                      onSelect={onStepSelect}
                      onDelete={handleDelete}
                      errors={getStepErrors(validationErrors, step.id)}
                    />
                    {showArrow && <div className="wf-list-arrow">&darr;</div>}
                  </div>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {workflow.steps.length > 0 && (
        <div className="wf-list-add">
          <StepTypePicker onSelect={onAddStep} />
        </div>
      )}
    </div>
  );
}
