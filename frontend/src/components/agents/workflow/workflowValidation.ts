import type { Workflow, WorkflowValidationError } from '../../../types/workflow';
import { STEP_TYPE_REGISTRY } from './stepTypeRegistry';

export function validateWorkflow(workflow: Workflow, enabledTools: string[]): WorkflowValidationError[] {
  const errors: WorkflowValidationError[] = [];

  // 1. Must have at least one step
  if (workflow.steps.length === 0) {
    errors.push({ level: 'error', message: 'Workflow must have at least one step.' });
    return errors;
  }

  // 2. Entry step must exist
  if (!workflow.steps.find(s => s.id === workflow.entry_step_id)) {
    errors.push({ level: 'error', message: 'Entry step is missing or invalid.' });
  }

  // 3. No orphan steps (steps with no incoming edge, except entry)
  const stepsWithIncoming = new Set(workflow.edges.map(e => e.target_step_id));
  for (const step of workflow.steps) {
    if (step.id !== workflow.entry_step_id && !stepsWithIncoming.has(step.id)) {
      errors.push({
        level: 'warning',
        step_id: step.id,
        message: `Step "${step.label}" is unreachable (no incoming connections).`,
      });
    }
  }

  // 4. Condition steps must have both true and false edges
  for (const step of workflow.steps.filter(s => s.type === 'condition')) {
    const outEdges = workflow.edges.filter(e => e.source_step_id === step.id);
    const hasTrue = outEdges.some(e => e.condition_branch === 'true');
    const hasFalse = outEdges.some(e => e.condition_branch === 'false');
    if (!hasTrue) {
      errors.push({
        level: 'error',
        step_id: step.id,
        message: `Condition "${step.label}" is missing a "true" branch connection.`,
      });
    }
    if (!hasFalse) {
      errors.push({
        level: 'error',
        step_id: step.id,
        message: `Condition "${step.label}" is missing a "false" branch connection.`,
      });
    }
  }

  // 5. No cycles
  if (detectCycle(workflow)) {
    errors.push({
      level: 'error',
      message: 'Workflow contains a cycle. Remove circular connections.',
    });
  }

  // 6. Execute steps require place_order tool
  for (const step of workflow.steps.filter(s => s.type === 'execute')) {
    if (!enabledTools.includes('place_order')) {
      errors.push({
        level: 'error',
        step_id: step.id,
        message: `Step "${step.label}" requires the "place_order" tool to be enabled in the Tools tab.`,
      });
    }
  }

  // 7. maxInstances check
  for (const [type, def] of Object.entries(STEP_TYPE_REGISTRY)) {
    if (def.maxInstances) {
      const count = workflow.steps.filter(s => s.type === type).length;
      if (count > def.maxInstances) {
        errors.push({
          level: 'warning',
          message: `${def.label} steps: ${count} found, recommended maximum is ${def.maxInstances}.`,
        });
      }
    }
  }

  // 8. Validate each step's config
  for (const step of workflow.steps) {
    const def = STEP_TYPE_REGISTRY[step.type];
    if (!def) continue;
    const result = def.configSchema.safeParse(step.config);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          level: 'error',
          step_id: step.id,
          message: `"${step.label}": ${issue.path.join('.')}: ${issue.message}`,
        });
      }
    }
  }

  return errors;
}

export function detectCycle(workflow: Workflow): boolean {
  const adj = new Map<string, string[]>();
  for (const edge of workflow.edges) {
    if (!adj.has(edge.source_step_id)) adj.set(edge.source_step_id, []);
    adj.get(edge.source_step_id)!.push(edge.target_step_id);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    inStack.add(nodeId);
    for (const neighbor of adj.get(nodeId) ?? []) {
      if (inStack.has(neighbor)) return true;
      if (!visited.has(neighbor) && dfs(neighbor)) return true;
    }
    inStack.delete(nodeId);
    return false;
  }

  for (const step of workflow.steps) {
    if (!visited.has(step.id) && dfs(step.id)) return true;
  }
  return false;
}

export function hasErrors(errors: WorkflowValidationError[]): boolean {
  return errors.some(e => e.level === 'error');
}

export function getStepErrors(errors: WorkflowValidationError[], stepId: string): WorkflowValidationError[] {
  return errors.filter(e => e.step_id === stepId);
}
