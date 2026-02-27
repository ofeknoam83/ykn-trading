import { useEffect, useState } from 'react';
import {
  getAgents,
  getAgent,
  getAgentTools,
  createAgent,
  updateAgent,
  deleteAgent,
  runAgent,
  getAgentRuns,
} from '../api/client';
import { JobProgress } from '../components/ui/JobProgress';
import { WorkflowEditor } from '../components/agents/workflow/WorkflowEditor';
import type { Workflow } from '../types/workflow';
import { createDefaultWorkflow } from '../types/workflow';

interface Agent {
  id: string;
  name: string;
  description?: string;
  model?: string;
  system_prompt?: string;
  workflow?: Workflow;
  enabled_tools?: string[];
}

interface Tool {
  name: string;
  description?: string;
}

type AgentTab = 'general' | 'workflow' | 'prompts' | 'tools';

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [form, setForm] = useState({ name: '', description: '', system_prompt: '', enabled_tools: [] as string[] });
  const [workflow, setWorkflow] = useState<Workflow>(createDefaultWorkflow());
  const [activeTab, setActiveTab] = useState<AgentTab>('general');
  const [runJobId, setRunJobId] = useState<string | null>(null);
  const [runs, setRuns] = useState<{ id: string; started_at?: string }[]>([]);

  function loadAgents() {
    getAgents().then((r) => setAgents(r.agents || [])).catch(() => {});
  }

  useEffect(() => {
    loadAgents();
    getAgentTools().then((r) => setTools(Array.isArray(r.tools) ? r.tools : [])).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (selectedId) {
      getAgent(selectedId).then((a) => {
        if (cancelled) return;
        setEditing(a);
        setWorkflow(a.workflow ?? createDefaultWorkflow());
      }).catch(() => { if (!cancelled) setEditing(null); });
      getAgentRuns(selectedId).then((r) => {
        if (cancelled) return;
        setRuns(r.runs || []);
      }).catch(() => { if (!cancelled) setRuns([]); });
    } else {
      setEditing(null);
      setRuns([]);
      setWorkflow(createDefaultWorkflow());
    }
    return () => { cancelled = true; };
  }, [selectedId]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description || '',
        system_prompt: editing.system_prompt || '',
        enabled_tools: editing.enabled_tools || [],
      });
    } else {
      setForm({ name: '', description: '', system_prompt: '', enabled_tools: [] });
    }
  }, [editing]);

  async function handleSave() {
    if (!form.name.trim()) return;
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        system_prompt: form.system_prompt || undefined,
        enabled_tools: form.enabled_tools,
        workflow: workflow as unknown as Record<string, unknown>,
      };
      if (editing) {
        await updateAgent(editing.id, payload);
      } else {
        const created = await createAgent(payload);
        setSelectedId(created.id);
      }
      loadAgents();
      setEditing(editing ? { ...editing, ...form, workflow } : null);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this agent?')) return;
    try {
      await deleteAgent(id);
      if (selectedId === id) setSelectedId(null);
      loadAgents();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRun(id: string) {
    try {
      const { job_id } = await runAgent(id, 'paper');
      setRunJobId(job_id);
    } catch (e) {
      console.error(e);
    }
  }

  function toggleTool(name: string) {
    setForm((f) => ({
      ...f,
      enabled_tools: f.enabled_tools.includes(name)
        ? f.enabled_tools.filter((t) => t !== name)
        : [...f.enabled_tools, name],
    }));
  }

  const TABS: { key: AgentTab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'workflow', label: 'Workflow' },
    { key: 'prompts', label: 'Prompts' },
    { key: 'tools', label: 'Tools' },
  ];

  return (
    <div className="agents-page">
      <h2>AI Trading Agents</h2>

      <div className="agents-layout">
        <aside className="agents-sidebar">
          <button
            type="button"
            className="new-agent-btn"
            onClick={() => {
              setEditing(null);
              setForm({ name: '', description: '', system_prompt: '', enabled_tools: [] });
              setWorkflow(createDefaultWorkflow());
              setSelectedId(null);
              setActiveTab('general');
            }}
          >
            + New Agent
          </button>
          <ul className="agents-list">
            {agents.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className={selectedId === a.id ? 'active' : ''}
                  onClick={() => setSelectedId(a.id)}
                >
                  {a.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="agents-main">
          {(editing || !selectedId) && (
            <>
              <div className="agent-tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    className={`agent-tab ${activeTab === tab.key ? 'agent-tab-active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'general' && (
                <div className="agent-form-panel">
                  <h3>{editing ? 'Edit Agent' : 'Create Agent'}</h3>
                  <div className="agent-form">
                    <label>
                      Name
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Agent name"
                      />
                    </label>
                    <label>
                      Description
                      <input
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Optional description"
                      />
                    </label>
                    <div className="form-actions">
                      <button onClick={handleSave}>Save</button>
                      {editing && (
                        <button className="danger" onClick={() => handleDelete(editing.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'workflow' && (
                <div className="agent-workflow-panel">
                  <WorkflowEditor
                    workflow={workflow}
                    onChange={setWorkflow}
                    enabledTools={form.enabled_tools}
                  />
                  <div className="form-actions" style={{ marginTop: '1rem' }}>
                    <button onClick={handleSave}>Save Agent</button>
                  </div>
                </div>
              )}

              {activeTab === 'prompts' && (
                <div className="agent-form-panel">
                  <h3>System Prompt</h3>
                  <div className="agent-form">
                    <label>
                      System Prompt
                      <textarea
                        value={form.system_prompt}
                        onChange={(e) => setForm((f) => ({ ...f, system_prompt: e.target.value }))}
                        placeholder="Instructions for the agent..."
                        rows={8}
                      />
                    </label>
                    <div className="form-actions">
                      <button onClick={handleSave}>Save</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tools' && (
                <div className="agent-form-panel">
                  <h3>Enabled Tools</h3>
                  <div className="tools-picker">
                    {tools.map((t) => (
                      <label key={t.name} className="tool-check">
                        <input
                          type="checkbox"
                          checked={form.enabled_tools.includes(t.name)}
                          onChange={() => toggleTool(t.name)}
                        />
                        {t.name}
                        {t.description && <span className="tool-desc"> - {t.description}</span>}
                      </label>
                    ))}
                    {tools.length === 0 && <p className="empty">No tools available</p>}
                  </div>
                  <div className="form-actions" style={{ marginTop: '1rem' }}>
                    <button onClick={handleSave}>Save</button>
                  </div>
                </div>
              )}
            </>
          )}

          {editing && (
            <>
              <div className="agent-run-panel">
                <h3>Run Agent</h3>
                <button onClick={() => handleRun(editing.id)} disabled={!!runJobId}>
                  Run (Paper)
                </button>
                <JobProgress jobId={runJobId} onComplete={() => setRunJobId(null)} onFailed={() => setRunJobId(null)} />
              </div>

              <div className="agent-runs-panel">
                <h3>Run History</h3>
                {runs.length === 0 ? (
                  <p className="empty">No runs yet</p>
                ) : (
                  <ul>
                    {runs.map((r) => (
                      <li key={r.id}>
                        Run {r.id.slice(0, 8)}... {r.started_at && new Date(r.started_at).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
