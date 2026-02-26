"""Pydantic schemas for data API."""

from datetime import datetime

from pydantic import BaseModel, Field


class Quote(BaseModel):
    """Current quote for a symbol."""

    symbol: str
    price: float
    change: float | None = None
    change_percent: float | None = None
    volume: int | None = None
    timestamp: datetime | None = None


class SymbolInfo(BaseModel):
    """Symbol search result."""

    symbol: str
    name: str
    asset_class: str = "stock"
    exchange: str | None = None


class Fundamentals(BaseModel):
    """Company fundamentals."""

    symbol: str
    pe_ratio: float | None = None
    debt_to_equity: float | None = None
    revenue_growth: float | None = None
    dividend_yield: float | None = None
    market_cap: float | None = None


class EarningsReport(BaseModel):
    """Earnings report for a quarter."""

    date: str
    revenue_actual: float | None = None
    revenue_estimate: float | None = None
    eps_actual: float | None = None
    eps_estimate: float | None = None
    beat_miss: str | None = None  # beat | miss | meet
