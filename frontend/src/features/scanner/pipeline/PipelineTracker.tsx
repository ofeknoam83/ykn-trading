import { useScannerStore } from '../stores/scannerStore';

export function PipelineTracker() {
  const { pipelineActions, results } = useScannerStore();

  if (results.length === 0) return null;

  const actedCount = new Set(pipelineActions.map((a) => a.matchId)).size;

  return (
    <div style={{ fontSize: 12, color: '#8b949e', padding: '4px 16px' }}>
      Actions taken: {actedCount} of {results.length} opportunities
      {pipelineActions.length > 0 && (
        <span style={{ marginLeft: 8 }}>
          ({pipelineActions.filter((a) => a.actionType === 'quick_backtest').length} backtests,{' '}
          {pipelineActions.filter((a) => a.actionType === 'build_strategy').length} strategies,{' '}
          {pipelineActions.filter((a) => a.actionType === 'create_agent').length} agents)
        </span>
      )}
    </div>
  );
}
