import type { BacktestResult, TradeRecord } from '../../../types/backtest';
import type { EnrichedTradeRecord, AgentAlphaAnalysis, AgentDecisionForensics } from '../../../types/forensics';
import { DecisionBreakdown } from './DecisionBreakdown';
import { AgentAlphaPanel } from './AgentAlphaPanel';
import { HoldDecisionAnalysis } from './HoldDecisionAnalysis';

interface AgentForensicsProps {
  result: BacktestResult;
  trade: TradeRecord | null;
  enrichedTrade: EnrichedTradeRecord | null;
  agentAlpha: AgentAlphaAnalysis | null;
  agentForensicsData?: AgentDecisionForensics | null;
  loading: boolean;
  error: string | null;
}

export function AgentForensics({
  trade,
  enrichedTrade,
  agentAlpha,
  agentForensicsData,
  loading,
  error,
}: AgentForensicsProps) {
  if (loading) {
    return (
      <div className="tf-agent">
        <div className="tf-loading">Loading agent forensics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tf-agent">
        <div className="tf-error">Failed to load agent forensics: {error}</div>
      </div>
    );
  }

  // Prefer explicitly-fetched per-trade forensics, fall back to enriched trade data
  const agentData = agentForensicsData ?? enrichedTrade?.agent_forensics ?? null;

  return (
    <div className="tf-agent">
      {/* Individual decision breakdown for selected trade */}
      {trade && agentData && (
        <DecisionBreakdown
          trade={trade}
          forensics={agentData}
        />
      )}

      {trade && !agentData && (
        <div className="tf-notice">
          No agent decision data available for this trade. Select an agent-sourced trade.
        </div>
      )}

      {!trade && (
        <div className="tf-empty-state">
          Select a trade from the sidebar to view agent decision details.
        </div>
      )}

      {/* Aggregate alpha analysis */}
      {agentAlpha && <AgentAlphaPanel alpha={agentAlpha} />}

      {/* Hold decisions */}
      {agentAlpha && agentAlpha.hold_decisions.length > 0 && (
        <HoldDecisionAnalysis holdDecisions={agentAlpha.hold_decisions} />
      )}
    </div>
  );
}
