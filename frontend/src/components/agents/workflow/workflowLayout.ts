import dagre from '@dagrejs/dagre';
import type { Workflow } from '../../../types/workflow';

export function autoLayout(workflow: Workflow): Workflow {
  if (workflow.steps.length === 0) return workflow;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
  });

  workflow.steps.forEach(step => {
    g.setNode(step.id, { width: 240, height: 72 });
  });

  workflow.edges.forEach(edge => {
    g.setEdge(edge.source_step_id, edge.target_step_id);
  });

  dagre.layout(g);

  return {
    ...workflow,
    steps: workflow.steps.map(step => {
      const nodeWithPosition = g.node(step.id);
      if (!nodeWithPosition) return step;
      return {
        ...step,
        position: {
          x: nodeWithPosition.x - 120,
          y: nodeWithPosition.y - 36,
        },
      };
    }),
  };
}

export function needsAutoLayout(workflow: Workflow): boolean {
  return workflow.steps.length > 0 && workflow.steps.every(
    s => !s.position || (s.position.x === 0 && s.position.y === 0)
  );
}
