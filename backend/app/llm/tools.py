"""LLM tools - real-time data for experts."""

from datetime import date, timedelta
from typing import Any

from app.providers.factory import get_provider
from app.providers.base import AssetClass
from app.brokers.paper_broker import PaperBroker


_broker = PaperBroker()


async def get_quote(symbol: str) -> str:
    """Get current quote for symbol."""
    provider = get_provider(AssetClass.STOCK if "/" not in symbol else AssetClass.CRYPTO)
    result = await provider.get_quote(symbol)
    return str(result)


async def get_fundamentals(symbol: str) -> str:
    """Get fundamentals (P/E, D/E, etc.). Uses YFinance."""
    from app.providers.stocks import YFinanceProvider
    p = YFinanceProvider()
    try:
        t = __import__("yfinance").Ticker(symbol)
        info = t.info
        return str({
            "pe_ratio": info.get("trailingPE"),
            "debt_to_equity": info.get("debtToEquity"),
            "revenue_growth": info.get("revenueGrowth"),
            "dividend_yield": info.get("dividendYield"),
        })
    except Exception as e:
        return str({"error": str(e)})


async def get_historical(symbol: str, start: str, end: str) -> str:
    """Get historical OHLCV. Dates as YYYY-MM-DD."""
    provider = get_provider(AssetClass.CRYPTO if "/" in symbol else AssetClass.STOCK)
    sd = date.fromisoformat(start) if isinstance(start, str) else start
    ed = date.fromisoformat(end) if isinstance(end, str) else end
    df = await provider.get_historical(symbol, sd, ed)
    if df.empty:
        return "No data"
    return df.tail(30).to_string()


async def get_portfolio() -> str:
    """Get current portfolio positions."""
    positions = await _broker.get_positions()
    return str(positions)


async def search_stocks(query: str) -> str:
    """Search stocks by query."""
    provider = get_provider(AssetClass.STOCK)
    results = await provider.search_symbols(query)
    return str(results[:15])


TOOLS_SCHEMA = [
    {
        "name": "get_quote",
        "description": "Get current price/quote for a symbol (e.g. AAPL, BTC/USDT)",
        "input_schema": {
            "type": "object",
            "properties": {"symbol": {"type": "string", "description": "Ticker symbol"}},
            "required": ["symbol"],
        },
    },
    {
        "name": "get_fundamentals",
        "description": "Get company fundamentals (P/E, debt-to-equity, revenue growth)",
        "input_schema": {
            "type": "object",
            "properties": {"symbol": {"type": "string"}},
            "required": ["symbol"],
        },
    },
    {
        "name": "get_historical",
        "description": "Get historical OHLCV data",
        "input_schema": {
            "type": "object",
            "properties": {
                "symbol": {"type": "string"},
                "start": {"type": "string", "description": "YYYY-MM-DD"},
                "end": {"type": "string", "description": "YYYY-MM-DD"},
            },
            "required": ["symbol", "start", "end"],
        },
    },
    {
        "name": "get_portfolio",
        "description": "Get current portfolio positions",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "search_stocks",
        "description": "Search stocks by name or ticker",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
]

TOOL_HANDLERS = {
    "get_quote": lambda **kw: get_quote(kw.get("symbol", "")),
    "get_fundamentals": lambda **kw: get_fundamentals(kw.get("symbol", "")),
    "get_historical": lambda **kw: get_historical(kw.get("symbol", ""), kw.get("start", ""), kw.get("end", "")),
    "get_portfolio": lambda **kw: get_portfolio(),
    "search_stocks": lambda **kw: search_stocks(kw.get("query", "")),
}
