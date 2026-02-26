"""LLM experts - full system prompts per expert."""

from app.llm.experts.goldman_screener import SYSTEM_PROMPT as SCREENER_PROMPT
from app.llm.experts.morgan_valuation import SYSTEM_PROMPT as VALUATION_PROMPT
from app.llm.experts.bridgewater_risk import SYSTEM_PROMPT as RISK_PROMPT
from app.llm.experts.jpmorgan_earnings import SYSTEM_PROMPT as EARNINGS_PROMPT
from app.llm.experts.blackrock_portfolio import SYSTEM_PROMPT as PORTFOLIO_PROMPT
from app.llm.experts.renaissance_patterns import SYSTEM_PROMPT as PATTERNS_PROMPT
from app.llm.experts.mckinsey_macro import SYSTEM_PROMPT as MACRO_PROMPT

EXPERT_PROMPTS = {
    "screener": SCREENER_PROMPT,
    "valuation": VALUATION_PROMPT,
    "risk": RISK_PROMPT,
    "risk-assessment": RISK_PROMPT,
    "earnings": EARNINGS_PROMPT,
    "portfolio": PORTFOLIO_PROMPT,
    "portfolio-builder": PORTFOLIO_PROMPT,
    "patterns": PATTERNS_PROMPT,
    "pattern-finder": PATTERNS_PROMPT,
    "macro": MACRO_PROMPT,
}
