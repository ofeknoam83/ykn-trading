import type { Node, Edge } from '@xyflow/react';
import type { Workflow, WorkflowStep, WorkflowEdge, ConditionConfig } from '../../../types/workflow';

export interface StepNodeData {
  step: WorkflowStep;
  isEntry: boolean;
  [key: string]: unknown;
}

export function workflowToReactFlow(workflow: Workflow): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = workflow.steps.map(step => ({
    id: step.id,
    type: step.type === 'condition' ? 'conditionNode' : 'stepNode',
    position: step.position ?? { x: 0, y: 0 },
    data: {
      step,
      isEntry: step.id === workflow.entry_step_id,
    } satisfies StepNodeData,
  }));

  const edges: Edge[] = workflow.edges.map(edge => {
    const sourceStep = workflow.steps.find(s => s.id === edge.source_step_id);
    const condConfig = sourceStep?.type === 'condition' ? sourceStep.config as ConditionConfig : null;

    return {
      id: edge.id,
      source: edge.source_step_id,
      target: edge.target_step_id,
      sourceHandle: edge.condition_branch ?? 'default',
      type: edge.condition_branch ? 'conditionEdge' : 'default',
      label: edge.condition_branch === 'true'
        ? (condConfig?.true_label ?? 'Yes')
        : edge.condition_branch === 'false'
        ? (condConfig?.false_label ?? 'No')
        : undefined,
      animated: edge.condition_branch === 'true',
      style: {
        stroke: edge.condition_branch === 'true' ? '#3fb950'
              : edge.condition_branch === 'false' ? '#f85149'
              : '#8b949e',
        strokeWidth: 2,
      },
    };
  });

  return { nodes, edges };
}

export function reactFlowToWorkflow(
  nodes: Node[],
  edges: readonly { id: string; source: string; target: string; sourceHandle?: string | null }[],
  prevWorkflow: Workflow
): Workflow {
  return {
    ...prevWorkflow,
    steps: prevWorkflow.steps.map(step => {
      const node = nodes.find(n => n.id === step.id);
      return node ? { ...step, position: node.position } : step;
    }),
    edges: edges.map(e => {
      const wfEdge: WorkflowEdge = {
        id: e.id,
        source_step_id: e.source,
        target_step_id: e.target,
      };
      if (e.sourceHandle === 'true' || e.sourceHandle === 'false') {
        wfEdge.condition_branch = e.sourceHandle;
      }
      return wfEdge;
    }),
  };
}
