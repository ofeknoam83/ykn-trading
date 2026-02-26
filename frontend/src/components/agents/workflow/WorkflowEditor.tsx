import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';
import type { Workflow, StepType, WorkflowStep, RunMode, TriggerConfig } from '../../../types/workflow';
import { useUndoRedo } from '../../../hooks/useUndoRedo';
import { STEP_TYPE_REGISTRY } from './stepTypeRegistry';
import { autoLayout, needsAutoLayout } from './workflowLayout';
import { validateWorkflow } from './workflowValidation';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowValidationBanner } from './WorkflowValidationBanner';
import { RunModeConfig } from './RunModeConfig';
import { StepConfigPanel } from './StepConfigPanel';
import { VisualWorkflowEditor } from './VisualWorkflowEditor';
import { ListWorkflowEditor } from './ListWorkflowEditor';

interface WorkflowEditorProps {
  workflow: Workflow;
  onChange: (workflow: Workflow) => void;
  enabledTools: string[];
}

export function WorkflowEditor({ workflow, onChange, enabledTools }: WorkflowEditorProps) {
  const [mode, setMode] = useState<'visual' | 'list'>('visual');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [layoutDirty, setLayoutDirty] = useState(false);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  const { state: undoState, set: setUndoState, undo, redo, canUndo, canRedo, reset: resetUndoState } = useUndoRedo(workflow);

  // Sync undo state back to parent
  useEffect(() => {
    onChange(undoState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoState]);

  // Sync external workflow changes into undo system
  useEffect(() => {
    resetUndoState(workflow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow.steps.length, workflow.entry_step_id]);

  const validationErrors = useMemo(
    () => validateWorkflow(undoState, enabledTools),
    [undoState, enabledTools]
  );

  // Auto-layout on first load
  useEffect(() => {
    if (needsAutoLayout(undoState)) {
      setUndoState(autoLayout(undoState));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWorkflowChange = useCallback(
    (newWorkflow: Workflow) => {
      setUndoState(newWorkflow);
    },
    [setUndoState]
  );

  const handleAddStep = useCallback(
    (type: StepType) => {
      const def = STEP_TYPE_REGISTRY[type];
      const newId = crypto.randomUUID();

      // Calculate position below existing steps
      const maxY = undoState.steps.reduce((max, s) => Math.max(max, s.position?.y ?? 0), 0);

      const newStep: WorkflowStep = {
        id: newId,
        type,
        label: def.label,
        config: JSON.parse(JSON.stringify(def.defaultConfig)),
        position: { x: 100, y: maxY + 150 },
      };

      const newSteps = [...undoState.steps, newStep];

      // Auto-create edge from last step if there are existing steps
      let newEdges = [...undoState.edges];
      if (undoState.steps.length > 0) {
        const lastStep = undoState.steps[undoState.steps.length - 1];
        // Don't auto-connect from condition steps (they need explicit branch connections)
        if (lastStep.type !== 'condition') {
          newEdges.push({
            id: crypto.randomUUID(),
            source_step_id: lastStep.id,
            target_step_id: newId,
          });
        }
      }

      const entryStepId = undoState.entry_step_id || newId;

      let newWorkflow: Workflow = {
        ...undoState,
        steps: newSteps,
        edges: newEdges,
        entry_step_id: entryStepId,
      };

      // Auto-layout if adding a condition (branching changes layout)
      if (type === 'condition') {
        newWorkflow = autoLayout(newWorkflow);
      }

      setUndoState(newWorkflow);
      setLayoutDirty(true);
    },
    [undoState, setUndoState]
  );

  const handleStepUpdate = useCallback(
    (updatedStep: WorkflowStep) => {
      setUndoState({
        ...undoState,
        steps: undoState.steps.map(s => (s.id === updatedStep.id ? updatedStep : s)),
      });
    },
    [undoState, setUndoState]
  );

  const handleStepDelete = useCallback(
    (stepId: string) => {
      const remainingSteps = undoState.steps.filter(s => s.id !== stepId);
      const remainingEdges = undoState.edges.filter(
        e => e.source_step_id !== stepId && e.target_step_id !== stepId
      );

      let entryStepId = undoState.entry_step_id;
      if (entryStepId === stepId) {
        entryStepId = remainingSteps.length > 0 ? remainingSteps[0].id : '';
      }

      setUndoState({
        ...undoState,
        steps: remainingSteps,
        edges: remainingEdges,
        entry_step_id: entryStepId,
      });

      setSelectedStepId(null);
    },
    [undoState, setUndoState]
  );

  const handleAutoArrange = useCallback(() => {
    setUndoState(autoLayout(undoState));
    setLayoutDirty(false);
  }, [undoState, setUndoState]);

  const handleZoomFit = useCallback(() => {
    reactFlowRef.current?.fitView({ padding: 0.2 });
  }, []);

  const handleModeChange = useCallback(
    (newMode: 'visual' | 'list') => {
      if (newMode === 'visual' && layoutDirty) {
        setUndoState(autoLayout(undoState));
        setLayoutDirty(false);
      }
      setMode(newMode);
    },
    [layoutDirty, undoState, setUndoState]
  );

  const handleRunModeChange = useCallback(
    (runMode: RunMode) => {
      setUndoState({ ...undoState, run_mode: runMode });
    },
    [undoState, setUndoState]
  );

  const handleTriggerConfigChange = useCallback(
    (triggerConfig: TriggerConfig) => {
      setUndoState({ ...undoState, trigger_config: triggerConfig });
    },
    [undoState, setUndoState]
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        undo();
      } else if (e.key === 'Escape') {
        setSelectedStepId(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const selectedStep = selectedStepId
    ? undoState.steps.find(s => s.id === selectedStepId)
    : null;

  return (
    <div className="wf-editor">
      <WorkflowToolbar
        mode={mode}
        onModeChange={handleModeChange}
        onAddStep={handleAddStep}
        onAutoArrange={handleAutoArrange}
        onZoomFit={handleZoomFit}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <WorkflowValidationBanner
        errors={validationErrors}
        onStepClick={setSelectedStepId}
      />

      <div className="wf-editor-body">
        <div className={`wf-editor-canvas ${selectedStep ? 'wf-editor-canvas-with-panel' : ''}`}>
          {mode === 'visual' ? (
            <VisualWorkflowEditor
              workflow={undoState}
              onChange={handleWorkflowChange}
              onStepSelect={setSelectedStepId}
              validationErrors={validationErrors}
              reactFlowRef={reactFlowRef}
            />
          ) : (
            <ListWorkflowEditor
              workflow={undoState}
              onChange={(wf) => {
                setLayoutDirty(true);
                handleWorkflowChange(wf);
              }}
              onStepSelect={setSelectedStepId}
              onAddStep={handleAddStep}
              validationErrors={validationErrors}
            />
          )}
        </div>

        {selectedStep && (
          <StepConfigPanel
            step={selectedStep}
            onUpdate={handleStepUpdate}
            onDelete={handleStepDelete}
            onClose={() => setSelectedStepId(null)}
          />
        )}
      </div>

      <RunModeConfig
        runMode={undoState.run_mode}
        triggerConfig={undoState.trigger_config}
        onRunModeChange={handleRunModeChange}
        onTriggerConfigChange={handleTriggerConfigChange}
      />
    </div>
  );
}
