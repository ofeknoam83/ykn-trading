"""LLM expert API endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel

from app.llm.orchestrator import run_expert
from app.llm.experts import EXPERT_PROMPTS

router = APIRouter()

EXPERT_META = [
    ("screener", "Stock Screener", "Goldman-style screening. Describe criteria (sector, valuation, growth)."),
    ("valuation", "DCF Valuation", "Morgan Stanley DCF. Provide ticker or portfolio context."),
    ("risk-assessment", "Risk Assessment", "Bridgewater-style risk analysis."),
    ("earnings", "Earnings Analysis", "JPMorgan earnings insights."),
    ("portfolio-builder", "Portfolio Builder", "BlackRock portfolio construction."),
    ("pattern-finder", "Pattern Finder", "Renaissance quant patterns."),
    ("macro", "Macro Report", "McKinsey macro analysis."),
]


@router.get("/experts")
async def list_experts():
    """List all experts with their system prompts."""
    experts = []
    for slug, name, description in EXPERT_META:
        prompt = EXPERT_PROMPTS.get(slug) or ""
        experts.append({
            "slug": slug,
            "name": name,
            "description": description,
            "prompt": prompt or "",
        })
    return {"experts": experts}


class ExpertRequest(BaseModel):
    """Expert request body."""

    input: str
    session_id: str | None = None


@router.post("/screener")
async def llm_screener(req: ExpertRequest):
    """Goldman-style stock screener."""
    report = await run_expert("screener", req.input)
    return {"report": report}


@router.post("/valuation")
async def llm_valuation(req: ExpertRequest):
    """Morgan Stanley DCF valuation."""
    report = await run_expert("valuation", req.input)
    return {"report": report}


@router.post("/risk-assessment")
async def llm_risk(req: ExpertRequest):
    """Bridgewater risk assessment."""
    report = await run_expert("risk", req.input)
    return {"report": report}


@router.post("/earnings")
async def llm_earnings(req: ExpertRequest):
    """JPMorgan earnings analyzer."""
    report = await run_expert("earnings", req.input)
    return {"report": report}


@router.post("/portfolio-builder")
async def llm_portfolio(req: ExpertRequest):
    """BlackRock portfolio builder."""
    report = await run_expert("portfolio", req.input)
    return {"report": report}


@router.post("/pattern-finder")
async def llm_patterns(req: ExpertRequest):
    """Renaissance pattern finder."""
    report = await run_expert("patterns", req.input)
    return {"report": report}


@router.post("/macro")
async def llm_macro(req: ExpertRequest):
    """McKinsey macro report."""
    report = await run_expert("macro", req.input)
    return {"report": report}
