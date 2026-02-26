"""Fundamentals time-series model."""

from datetime import datetime

from sqlalchemy import Float, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Fundamentals(Base):
    """Company fundamentals snapshot."""

    __tablename__ = "fundamentals"

    symbol: Mapped[str] = mapped_column(String(32), primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    pe_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    debt_to_equity: Mapped[float | None] = mapped_column(Float, nullable=True)
    revenue_growth: Mapped[float | None] = mapped_column(Float, nullable=True)
    dividend_yield: Mapped[float | None] = mapped_column(Float, nullable=True)
    market_cap: Mapped[float | None] = mapped_column(Float, nullable=True)
