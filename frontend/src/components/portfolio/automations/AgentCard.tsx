import { useState } from 'react';
import type { AgentStatus } from '../../../types/portfolio';
import { pauseAgent, resumeAgent, stopAgent, disableAgentTrading } from '../../../api/portfolioApi';

interface Props {
  agent: AgentStatus;
  onRefresh: () => void;
}

function formatPnL(amount: number, percent: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} (${sign}${percent.toFixed(2)}%)`;
}

export function AgentCard({ agent, onRefresh }: Props) {
  const [acting, setActing] = useState(false);

  async function handlePause() {
    setActing(true);
    try {
      if (agent.status === 'paused') {
        await resumeAgent(agent.id);
      } else {
        await pauseAgent(agent.id);
      }
      onRefresh();
    } finally {
      setActing(false);
    }
  }

  async function handleStop() {
    if (!confirm(`Stop ${agent.name}? Active positions will remain open but no new trades will be placed.`)) return;
    setActing(true);
    try {
      await stopAgent(agent.id);
      onRefresh();
    } finally {
      setActing(false);
    }
  }

  async function handleDisableTrading() {
    if (!confirm(`Disable trading for ${agent.name}? The agent will continue analyzing but cannot place orders.`)) return;
    setActing(true);
    try {
      await disableAgentTrading(agent.id);
      onRefresh();
    } finally {
      setActing(false);
    }
  }

  return (
    <div className={`poc-auto-card poc-auto-${agent.status}`}>
      <div className="poc-auto-card-header">
        <span className="poc-auto-icon">{'\u{1F916}'}</span>
        <span className="poc-auto-name">{agent.name}</span>
        <span className={`poc-status-dot ${agent.status}`} title={agent.status} />
      </div>

      <div className="poc-auto-card-body">
        <div className="poc-auto-meta">
          <span>Status: <strong>{agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}</strong></span>
          <span>Model: {agent.model}</span>
        </div>
        <div className="poc-auto-meta">
          <span>Run Mode: {agent.run_mode}</span>
          {agent.current_run && <span>Run #{agent.current_run}</span>}
        </div>
        <div className="poc-auto-pnl">
          <span className={`poc-pnl ${agent.day_pnl.amount >= 0 ? 'positive' : 'negative'}`}>
            Day: {formatPnL(agent.day_pnl.amount, agent.day_pnl.percent)}
          </span>
          <span className={`poc-pnl ${agent.total_pnl.amount >= 0 ? 'positive' : 'negative'}`}>
            Total: {formatPnL(agent.total_pnl.amount, agent.total_pnl.percent)}
          </span>
        </div>
        {agent.last_decision && (
          <div className="poc-auto-last-action poc-muted">Last: {agent.last_decision}</div>
        )}
        {agent.next_run && (
          <div className="poc-auto-next poc-muted">Next run: {agent.next_run}</div>
        )}
        <div className="poc-auto-tools poc-muted">
          Tools: {agent.enabled_tools.join(', ')}
        </div>
        {!agent.trading_enabled && (
          <div className="poc-auto-warning">Trading disabled</div>
        )}
      </div>

      <div className="poc-auto-card-actions">
        <button
          className={`poc-btn-sm ${agent.status === 'paused' ? 'poc-btn-primary' : 'poc-btn-warning'}`}
          onClick={handlePause}
          disabled={acting || agent.status === 'stopped'}
        >
          {agent.status === 'paused' ? '\u25B6 Resume' : '\u23F8 Pause'}
        </button>
        <button className="poc-btn-sm poc-btn-ghost">View Run</button>
        <button
          className="poc-btn-sm poc-btn-danger-ghost"
          onClick={handleStop}
          disabled={acting || agent.status === 'stopped'}
        >
          Stop
        </button>
        {agent.trading_enabled && (
          <button
            className="poc-btn-sm poc-btn-danger-ghost"
            onClick={handleDisableTrading}
            disabled={acting}
          >
            Disable Trading
          </button>
        )}
      </div>
    </div>
  );
}
