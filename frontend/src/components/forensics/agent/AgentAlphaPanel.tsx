import type { AgentAlphaAnalysis } from '../../../types/forensics';

interface AgentAlphaPanelProps {
  alpha: AgentAlphaAnalysis;
}

export function AgentAlphaPanel({ alpha }: AgentAlphaPanelProps) {
  const bestBaseline = alpha.baselines.reduce(
    (best, b) => (b.sharpe > best.sharpe ? b : best),
    alpha.baselines[0]
  );

  return (
    <div className="tf-agent-alpha">
      <h5>Agent Alpha Analysis</h5>
      <p className="tf-chart-subtitle">Is the AI agent adding value over simple rules?</p>

      {/* Agent performance summary */}
      <div className="tf-alpha-summary">
        <div className="tf-alpha-metrics">
          <div className="tf-alpha-metric">
            <span className="tf-detail-label">Total decisions</span>
            <span className="tf-detail-value mono">{alpha.total_decisions} ({alpha.total_trades} trades, {alpha.total_holds} holds)</span>
          </div>
          <div className="tf-alpha-metric">
            <span className="tf-detail-label">Trade win rate</span>
            <span className="tf-detail-value mono">{(alpha.trade_win_rate * 100).toFixed(0)}%</span>
          </div>
          <div className="tf-alpha-metric">
            <span className="tf-detail-label">Avg return per trade</span>
            <span className={`tf-detail-value mono ${alpha.avg_return_per_trade >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
              {(alpha.avg_return_per_trade * 100).toFixed(1)}%
            </span>
          </div>
          <div className="tf-alpha-metric">
            <span className="tf-detail-label">Agent Sharpe</span>
            <span className="tf-detail-value mono">{alpha.agent_sharpe.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Baselines comparison */}
      <div className="tf-baselines">
        <h6>Simple Rule Baselines</h6>
        <table>
          <thead>
            <tr>
              <th>Rule</th>
              <th>Sharpe</th>
              <th>vs Agent</th>
            </tr>
          </thead>
          <tbody>
            {alpha.baselines.map((b) => (
              <tr key={b.rule_name}>
                <td>{b.rule_name}</td>
                <td className="mono">{b.sharpe.toFixed(2)}</td>
                <td className={`mono ${b.delta_vs_agent > 0 ? 'bt-metric-positive' : b.delta_vs_agent < 0 ? 'bt-metric-negative' : ''}`}>
                  {b.delta_vs_agent > 0 ? '+' : ''}
                  {b.delta_vs_agent.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alpha decomposition */}
      <div className="tf-alpha-decomposition">
        <h6>AI Alpha Decomposition</h6>
        <div className="tf-decomp-box">
          <div className="tf-decomp-row">
            <span>Total agent Sharpe:</span>
            <span className="mono">{alpha.agent_sharpe.toFixed(2)}</span>
          </div>
          <div className="tf-decomp-row">
            <span>\u2212 Best simple rule ({bestBaseline?.rule_name}):</span>
            <span className="mono">{bestBaseline?.sharpe.toFixed(2)}</span>
          </div>
          <div className="tf-decomp-divider" />
          <div className="tf-decomp-row tf-decomp-total">
            <span>= AI Alpha:</span>
            <span className={`mono ${alpha.alpha_decomposition.total_alpha >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
              {alpha.alpha_decomposition.total_alpha >= 0 ? '+' : ''}
              {alpha.alpha_decomposition.total_alpha.toFixed(2)}
            </span>
          </div>
          {alpha.alpha_decomposition.sources.map((s) => (
            <div key={s.source} className="tf-decomp-row tf-decomp-source">
              <span>\u2022 {s.source}:</span>
              <span className="mono">
                {s.contribution >= 0 ? '+' : ''}
                {s.contribution.toFixed(2)}
              </span>
              <span className="tf-decomp-detail">({s.detail})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cost analysis */}
      <div className="tf-cost-analysis">
        <h6>Cost Analysis</h6>
        <div className="tf-detail-grid">
          <div className="tf-detail-row">
            <span className="tf-detail-label">Agent LLM cost</span>
            <span className="tf-detail-value mono">
              ${alpha.cost_analysis.llm_cost_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="tf-detail-row">
            <span className="tf-detail-label">Alpha value (additional P&L)</span>
            <span className="tf-detail-value mono bt-metric-positive">
              +${alpha.cost_analysis.alpha_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="tf-detail-row">
            <span className="tf-detail-label">Net AI value</span>
            <span className={`tf-detail-value mono ${alpha.cost_analysis.net_value >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
              {alpha.cost_analysis.net_value >= 0 ? '+' : ''}$
              {alpha.cost_analysis.net_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {alpha.cost_analysis.net_value >= 0 ? ' \u2705' : ' \u274C'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
