import type { StepType } from '../../../types/workflow';
import { StepTypePicker } from './StepTypePicker';

interface WorkflowToolbarProps {
  mode: 'visual' | 'list';
  onModeChange: (mode: 'visual' | 'list') => void;
  onAddStep: (type: StepType) => void;
  onAutoArrange: () => void;
  onZoomFit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function WorkflowToolbar({
  mode,
  onModeChange,
  onAddStep,
  onAutoArrange,
  onZoomFit,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: WorkflowToolbarProps) {
  return (
    <div className="wf-toolbar">
      <div className="wf-toolbar-left">
        <StepTypePicker onSelect={onAddStep} />
        {mode === 'visual' && (
          <>
            <button className="wf-toolbar-btn" onClick={onAutoArrange} title="Auto-arrange nodes">
              Auto-arrange
            </button>
            <button className="wf-toolbar-btn" onClick={onZoomFit} title="Fit view">
              Zoom Fit
            </button>
          </>
        )}
        <button className="wf-toolbar-btn" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button className="wf-toolbar-btn" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          Redo
        </button>
      </div>

      <div className="wf-toolbar-right">
        <div className="wf-mode-toggle">
          <button
            className={`wf-mode-btn ${mode === 'visual' ? 'wf-mode-active' : ''}`}
            onClick={() => onModeChange('visual')}
          >
            Visual
          </button>
          <button
            className={`wf-mode-btn ${mode === 'list' ? 'wf-mode-active' : ''}`}
            onClick={() => onModeChange('list')}
          >
            List
          </button>
        </div>
      </div>
    </div>
  );
}
