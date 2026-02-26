import { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
import type { Connection, ReactFlowInstance, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { Workflow, WorkflowValidationError } from '../../../types/workflow';
import { workflowToReactFlow, reactFlowToWorkflow } from './workflowToReactFlow';
import { WorkflowStepNode } from './WorkflowStepNode';
import { ConditionStepNode } from './ConditionStepNode';
import { ConditionEdge } from './ConditionEdge';
import { getStepErrors } from './workflowValidation';

interface VisualWorkflowEditorProps {
  workflow: Workflow;
  onChange: (workflow: Workflow) => void;
  onStepSelect: (stepId: string | null) => void;
  validationErrors: WorkflowValidationError[];
  reactFlowRef: React.MutableRefObject<ReactFlowInstance | null>;
}

const nodeTypes = {
  stepNode: WorkflowStepNode,
  conditionNode: ConditionStepNode,
};

const edgeTypes = {
  conditionEdge: ConditionEdge,
};

export function VisualWorkflowEditor({
  workflow,
  onChange,
  onStepSelect,
  validationErrors,
  reactFlowRef,
}: VisualWorkflowEditorProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => workflowToReactFlow(workflow),
    // Only recompute when workflow identity changes (steps/edges count or IDs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workflow.steps.length, workflow.edges.length, workflow.entry_step_id]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const isUpdatingRef = useRef(false);

  // Sync from workflow prop to ReactFlow state
  useEffect(() => {
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }
    const { nodes: newNodes, edges: newEdges } = workflowToReactFlow(workflow);

    // Inject validation errors into node data
    const nodesWithErrors = newNodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        validationErrors: getStepErrors(validationErrors, n.id),
      },
    }));

    setNodes(nodesWithErrors);
    setEdges(newEdges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow, validationErrors]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceStep = workflow.steps.find(s => s.id === connection.source);
      const isConditionSource = sourceStep?.type === 'condition';
      const sourceHandle = connection.sourceHandle;

      const edgeId: string = crypto.randomUUID();
      const newEdge: Edge = {
        ...connection,
        id: edgeId,
        source: connection.source!,
        target: connection.target!,
        type: isConditionSource ? 'conditionEdge' : 'default',
        animated: sourceHandle === 'true',
        style: {
          stroke: sourceHandle === 'true' ? '#3fb950'
                : sourceHandle === 'false' ? '#f85149'
                : '#8b949e',
          strokeWidth: 2,
        },
      };

      setEdges(eds => {
        const updated = addEdge(newEdge, eds);
        // Sync back to workflow
        isUpdatingRef.current = true;
        const updatedWorkflow = reactFlowToWorkflow(nodes, updated, workflow);
        onChange(updatedWorkflow);
        return updated;
      });
    },
    [workflow, nodes, setEdges, onChange]
  );

  const onNodeDragStop = useCallback(() => {
    isUpdatingRef.current = true;
    const updatedWorkflow = reactFlowToWorkflow(nodes, edges, workflow);
    onChange(updatedWorkflow);
  }, [nodes, edges, workflow, onChange]);

  const onNodesDelete = useCallback(
    (deleted: { id: string }[]) => {
      const deletedIds = new Set(deleted.map(n => n.id));
      const remainingSteps = workflow.steps.filter(s => !deletedIds.has(s.id));
      const remainingEdges = workflow.edges.filter(
        e => !deletedIds.has(e.source_step_id) && !deletedIds.has(e.target_step_id)
      );

      let entryStepId = workflow.entry_step_id;
      if (deletedIds.has(entryStepId)) {
        entryStepId = remainingSteps.length > 0 ? remainingSteps[0].id : '';
      }

      isUpdatingRef.current = true;
      onChange({
        ...workflow,
        steps: remainingSteps,
        edges: remainingEdges,
        entry_step_id: entryStepId,
      });
    },
    [workflow, onChange]
  );

  const onEdgesDelete = useCallback(
    (deleted: { id: string }[]) => {
      const deletedIds = new Set(deleted.map(e => e.id));
      isUpdatingRef.current = true;
      onChange({
        ...workflow,
        edges: workflow.edges.filter(e => !deletedIds.has(e.id)),
      });
    },
    [workflow, onChange]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: { id: string }) => {
      onStepSelect(node.id);
    },
    [onStepSelect]
  );

  const onPaneClick = useCallback(() => {
    onStepSelect(null);
  }, [onStepSelect]);

  return (
    <div className="wf-visual-editor">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={(instance) => { reactFlowRef.current = instance; }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        className="wf-reactflow"
      >
        <Controls />
        <MiniMap
          style={{ background: '#161b22' }}
          nodeColor="#30363d"
          maskColor="rgba(0,0,0,0.4)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#30363d" />
      </ReactFlow>

      {workflow.steps.length === 0 && (
        <div className="wf-empty-state">
          <p>No steps yet. Use "+ Add Step" to begin building your workflow.</p>
        </div>
      )}
    </div>
  );
}
