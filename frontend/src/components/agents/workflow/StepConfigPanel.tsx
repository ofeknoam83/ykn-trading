import { useState, useEffect } from 'react';
import type { WorkflowStep, StepConfig } from '../../../types/workflow';
import { STEP_TYPE_REGISTRY } from './stepTypeRegistry';
import { AnalyzeMarketConfigForm } from './config-forms/AnalyzeMarketConfigForm';
import { FetchPortfolioConfigForm } from './config-forms/FetchPortfolioConfigForm';
import { EvaluatePositionsConfigForm } from './config-forms/EvaluatePositionsConfigForm';
import { ResearchConfigForm } from './config-forms/ResearchConfigForm';
import { DecideActionsConfigForm } from './config-forms/DecideActionsConfigForm';
import { ExecuteConfigForm } from './config-forms/ExecuteConfigForm';
import { ReportConfigForm } from './config-forms/ReportConfigForm';
import { ConditionConfigForm } from './config-forms/ConditionConfigForm';
import { CustomConfigForm } from './config-forms/CustomConfigForm';
import type {
  AnalyzeMarketConfig,
  FetchPortfolioConfig,
  EvaluatePositionsConfig,
  ResearchConfig,
  DecideActionsConfig,
  ExecuteConfig,
  ReportConfig,
  ConditionConfig,
  CustomConfig,
} from '../../../types/workflow';

interface StepConfigPanelProps {
  step: WorkflowStep;
  onUpdate: (step: WorkflowStep) => void;
  onDelete: (stepId: string) => void;
  onClose: () => void;
}

export function StepConfigPanel({ step, onUpdate, onDelete, onClose }: StepConfigPanelProps) {
  const [label, setLabel] = useState(step.label);
  const [config, setConfig] = useState<StepConfig>(step.config);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const def = STEP_TYPE_REGISTRY[step.type];

  useEffect(() => {
    setLabel(step.label);
    setConfig(step.config);
    setErrors({});
  }, [step.id, step.label, step.config]);

  function handleApply() {
    const result = def.configSchema.safeParse(config);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errs[issue.path.join('.')] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    onUpdate({ ...step, label, config });
  }

  function handleDelete() {
    if (step.type === 'execute') {
      if (!confirm('This will remove trade execution from the workflow. Continue?')) return;
    }
    onDelete(step.id);
  }

  function renderConfigForm() {
    const formProps = { errors };
    switch (step.type) {
      case 'analyze_market':
        return <AnalyzeMarketConfigForm config={config as AnalyzeMarketConfig} onChange={setConfig} {...formProps} />;
      case 'fetch_portfolio':
        return <FetchPortfolioConfigForm config={config as FetchPortfolioConfig} onChange={setConfig} {...formProps} />;
      case 'evaluate_positions':
        return <EvaluatePositionsConfigForm config={config as EvaluatePositionsConfig} onChange={setConfig} {...formProps} />;
      case 'research':
        return <ResearchConfigForm config={config as ResearchConfig} onChange={setConfig} {...formProps} />;
      case 'decide_actions':
        return <DecideActionsConfigForm config={config as DecideActionsConfig} onChange={setConfig} {...formProps} />;
      case 'execute':
        return <ExecuteConfigForm config={config as ExecuteConfig} onChange={setConfig} {...formProps} />;
      case 'report':
        return <ReportConfigForm config={config as ReportConfig} onChange={setConfig} {...formProps} />;
      case 'condition':
        return <ConditionConfigForm config={config as ConditionConfig} onChange={setConfig} {...formProps} />;
      case 'custom':
        return <CustomConfigForm config={config as CustomConfig} onChange={setConfig} {...formProps} />;
      default:
        return <p>Unknown step type</p>;
    }
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
        {renderConfigForm()}
      </div>

      <div className="scp-footer">
        <button className="scp-delete-btn" onClick={handleDelete}>Delete Step</button>
        <button className="scp-apply-btn" onClick={handleApply}>Apply</button>
      </div>
    </div>
  );
}
