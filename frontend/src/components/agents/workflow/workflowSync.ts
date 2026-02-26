import type { WorkflowStep, WorkflowEdge } from '../../../types/workflow';

export function recomputeEdgesForLinearOrder(
  steps: WorkflowStep[],
  existingEdges: WorkflowEdge[]
): WorkflowEdge[] {
  const newEdges: WorkflowEdge[] = [];

  // Preserve condition branch edges as-is
  const conditionEdges = existingEdges.filter(e => e.condition_branch);

  // Track which steps are condition branch targets
  const conditionTargetIds = new Set(conditionEdges.map(e => e.target_step_id));

  // Track condition step IDs
  const conditionStepIds = new Set(
    steps.filter(s => s.type === 'condition').map(s => s.id)
  );

  let prevStepId: string | null = null;

  for (const step of steps) {
    // Don't create an incoming linear edge to a step that's a condition branch target
    const isConditionTarget = conditionTargetIds.has(step.id);

    if (prevStepId && !conditionStepIds.has(prevStepId) && !isConditionTarget) {
      newEdges.push({
        id: crypto.randomUUID(),
        source_step_id: prevStepId,
        target_step_id: step.id,
      });
    }

    prevStepId = step.id;
  }

  return [...newEdges, ...conditionEdges];
}

export function getTopologicalOrder(steps: WorkflowStep[], edges: WorkflowEdge[], entryStepId: string): WorkflowStep[] {
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adj.has(edge.source_step_id)) adj.set(edge.source_step_id, []);
    adj.get(edge.source_step_id)!.push(edge.target_step_id);
  }

  const visited = new Set<string>();
  const order: string[] = [];

  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    for (const neighbor of adj.get(nodeId) ?? []) {
      dfs(neighbor);
    }
    order.unshift(nodeId);
  }

  // Start from entry step
  dfs(entryStepId);

  // Visit any remaining unvisited steps
  for (const step of steps) {
    if (!visited.has(step.id)) {
      dfs(step.id);
    }
  }

  const stepMap = new Map(steps.map(s => [s.id, s]));
  return order.map(id => stepMap.get(id)!).filter(Boolean);
}

export function findNextEntryStep(
  steps: WorkflowStep[],
  edges: WorkflowEdge[],
  removedStepId: string
): string | '' {
  if (steps.length === 0) return '';

  // Find step with no incoming edges (other than the removed one)
  const stepsWithIncoming = new Set(
    edges
      .filter(e => e.source_step_id !== removedStepId && e.target_step_id !== removedStepId)
      .map(e => e.target_step_id)
  );

  const roots = steps.filter(s => s.id !== removedStepId && !stepsWithIncoming.has(s.id));
  if (roots.length > 0) return roots[0].id;

  // Fallback: first remaining step
  const remaining = steps.filter(s => s.id !== removedStepId);
  return remaining.length > 0 ? remaining[0].id : '';
}
