import type { StrategyStatus, AgentStatus } from '../../../types/portfolio';
import { StrategyCard } from './StrategyCard';
import { AgentCard } from './AgentCard';

interface Props {
  strategies: StrategyStatus[];
  agents: AgentStatus[];
  onRefreshStrategies: () => void;
  onRefreshAgents: () => void;
}

export function AutomationMonitor({ strategies, agents, onRefreshStrategies, onRefreshAgents }: Props) {
  return (
    <div className="poc-automation-panel">
      <div className="poc-automation-section">
        <h3 className="poc-panel-title">Strategies ({strategies.length})</h3>
        {strategies.length === 0 ? (
          <div className="poc-automation-empty">No strategies configured</div>
        ) : (
          <div className="poc-automation-cards">
            {strategies.map((s) => (
              <StrategyCard key={s.id} strategy={s} onRefresh={onRefreshStrategies} />
            ))}
          </div>
        )}
      </div>

      <div className="poc-automation-section">
        <h3 className="poc-panel-title">AI Agents ({agents.length})</h3>
        {agents.length === 0 ? (
          <div className="poc-automation-empty">No agents configured</div>
        ) : (
          <div className="poc-automation-cards">
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} onRefresh={onRefreshAgents} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
