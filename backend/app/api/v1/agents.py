"""AI trading agents API."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.llm.tools import TOOLS_SCHEMA

router = APIRouter()

# In-memory agent store - replace with DB later
_agents: dict[str, dict] = {}


class AgentCreate(BaseModel):
    """Agent create/update body."""

    name: str
    description: str | None = None
    model: str = "claude-sonnet-4-20250514"
    system_prompt: str = ""
    workflow: dict | None = None
    enabled_tools: list[str] = []


class AgentRunRequest(BaseModel):
    """Agent run request."""

    mode: str = "paper"  # paper | live


@router.get("/tools")  # Must be before /{agent_id}
async def list_agent_tools():
    """List available tools for agents."""
    return {"tools": TOOLS_SCHEMA}


@router.get("")
async def list_agents():
    """List all agents."""
    return {"agents": list(_agents.values())}


@router.post("")
async def create_agent(agent: AgentCreate):
    """Create agent."""
    import uuid
    agent_id = str(uuid.uuid4())
    _agents[agent_id] = {
        "id": agent_id,
        "name": agent.name,
        "description": agent.description,
        "model": agent.model,
        "system_prompt": agent.system_prompt,
        "workflow": agent.workflow or {},
        "enabled_tools": agent.enabled_tools,
    }
    return _agents[agent_id]


@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    """Get agent by id."""
    if agent_id not in _agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    return _agents[agent_id]


@router.put("/{agent_id}")
async def update_agent(agent_id: str, agent: AgentCreate):
    """Update agent."""
    if agent_id not in _agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    _agents[agent_id].update(agent.model_dump())
    return _agents[agent_id]


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete agent."""
    if agent_id not in _agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    del _agents[agent_id]
    return {"ok": True}


@router.post("/{agent_id}/run")
async def run_agent(agent_id: str, req: AgentRunRequest):
    """Start agent run. Returns job_id - poll GET /jobs/{id}."""
    from app.core.jobs import create_job

    if agent_id not in _agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    job_id = create_job("agent_run")
    # TODO: Start agent executor as background task
    return {"job_id": job_id, "mode": req.mode}


@router.get("/{agent_id}/runs")
async def list_agent_runs(agent_id: str):
    """List agent run history."""
    if agent_id not in _agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"runs": []}  # TODO: fetch from DB
