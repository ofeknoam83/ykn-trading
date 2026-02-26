import { useState } from 'react';
import type { TradeRecord } from '../../../types/backtest';
import type { AgentDecisionForensics } from '../../../types/forensics';

interface DecisionBreakdownProps {
  trade: TradeRecord;
  forensics: AgentDecisionForensics;
}

export function DecisionBreakdown({ trade, forensics }: DecisionBreakdownProps) {
  const [showFullReasoning, setShowFullReasoning] = useState(false);

  const displayedSteps = showFullReasoning
    ? forensics.reasoning_chain
    : forensics.reasoning_chain.slice(0, 3);
  const hasMore = forensics.reasoning_chain.length > 3;

  return (
    <div className="tf-decision-breakdown">
      <h4>
        Agent Decision: {forensics.action.toUpperCase()}{' '}
        {forensics.quantity} {forensics.symbol} @ ${forensics.price?.toFixed(2) ?? '—'}
      </h4>

      {/* Decision Summary */}
      <div className="tf-panel tf-decision-summary">
        <h5>Decision Summary</h5>
        <div className="tf-detail-grid">
          <div className="tf-detail-row">
            <span className="tf-detail-label">Action</span>
            <span className="tf-detail-value">
              {forensics.action.toUpperCase()} {forensics.quantity} shares {forensics.symbol}
            </span>
          </div>
          <div className="tf-detail-row">
            <span className="tf-detail-label">Confidence</span>
            <span className="tf-detail-value">{forensics.confidence}%</span>
          </div>
          <div className="tf-detail-row">
            <span className="tf-detail-label">Time</span>
            <span className="tf-detail-value">{new Date(forensics.timestamp).toLocaleString()}</span>
          </div>
          {forensics.outcome && (
            <div className="tf-detail-row">
              <span className="tf-detail-label">Outcome</span>
              <span className={`tf-detail-value mono ${forensics.outcome.pnl >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                ${forensics.outcome.pnl.toFixed(2)} ({(forensics.outcome.pnl_pct * 100).toFixed(1)}%) over{' '}
                {trade.duration_days} days
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Data Consumed */}
      <div className="tf-panel tf-data-consumed">
        <h5>Data Consumed</h5>
        <div className="tf-tool-calls">
          <h6>Tool Calls Made:</h6>
          {forensics.tool_calls.map((tc, i) => (
            <div key={i} className="tf-tool-call">
              <span className="tf-tool-index">{i + 1}.</span>
              <span className="tf-tool-name mono">{tc.tool}</span>
              <span className="tf-tool-args mono">
                ({Object.entries(tc.args).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')})
              </span>
              <span className="tf-tool-arrow">\u2192</span>
              <span className="tf-tool-result">{tc.result_summary}</span>
              <span className="tf-tool-latency">{tc.latency_ms}ms</span>
            </div>
          ))}
        </div>

        {forensics.available_tools_not_used.length > 0 && (
          <div className="tf-unused-tools">
            <h6>Data NOT requested (available but unused):</h6>
            {forensics.available_tools_not_used.map((tool, i) => (
              <div key={i} className="tf-unused-tool">
                \u26A0\uFE0F {tool}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reasoning Chain */}
      <div className="tf-panel tf-reasoning-chain">
        <h5>Reasoning Chain</h5>
        {displayedSteps.map((step) => (
          <div key={step.step} className="tf-reasoning-step">
            <div className="tf-step-header">
              <span className="tf-step-number">Step {step.step}:</span>
              <span className="tf-step-title">{step.title}</span>
            </div>
            <div className="tf-step-content">{step.content}</div>
          </div>
        ))}
        {hasMore && !showFullReasoning && (
          <button
            className="bt-action-btn"
            onClick={() => setShowFullReasoning(true)}
          >
            Show full reasoning chain ({forensics.reasoning_chain.length} steps)
          </button>
        )}
      </div>

      {/* Alternatives Considered */}
      {forensics.alternatives_considered.length > 0 && (
        <div className="tf-panel tf-alternatives">
          <h5>Alternatives Considered</h5>
          {forensics.alternatives_considered.map((alt, i) => (
            <div key={i} className="tf-alternative">
              <span className="tf-alt-icon">\u274C</span>
              <span className="tf-alt-action">{alt.action}</span>
              <span className="tf-alt-separator">\u2014</span>
              <span className="tf-alt-reason">"{alt.reason_rejected}"</span>
            </div>
          ))}
        </div>
      )}

      {/* Benchmark Comparison */}
      {forensics.benchmark_rules.length > 0 && (
        <div className="tf-panel tf-benchmark-compare">
          <h5>Benchmark Comparison</h5>
          <p className="tf-chart-subtitle">What would simple rules have done?</p>
          <table>
            <thead>
              <tr>
                <th>Rule</th>
                <th>Signal</th>
                <th>Hypothetical Return</th>
              </tr>
            </thead>
            <tbody>
              {forensics.benchmark_rules.map((br, i) => (
                <tr key={i}>
                  <td>{br.rule_name}</td>
                  <td>
                    {br.signal_on_date ? (
                      <span className="bt-metric-positive">\u2705 Signal fired</span>
                    ) : (
                      <span className="tf-muted">No signal</span>
                    )}
                  </td>
                  <td className="mono">
                    {br.hypothetical_return !== undefined
                      ? `${(br.hypothetical_return * 100).toFixed(1)}%`
                      : '\u2014'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
