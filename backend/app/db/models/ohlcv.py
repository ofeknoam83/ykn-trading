"""OHLCV time-series model."""

from datetime import datetime

from sqlalchemy import Float, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class OHLCV(Base):
    """OHLCV candle data - use as hypertable in TimescaleDB."""

    __tablename__ = "ohlcv"

    __table_args__ = (
        # TimescaleDB hypertable - run after table create:
        # SELECT create_hypertable('ohlcv', 'bucket', if_not_exists => TRUE);
        {"schema": None},
    )

    symbol: Mapped[str] = mapped_column(String(32), primary_key=True)
    interval: Mapped[str] = mapped_column(String(8), primary_key=True)  # 1m, 5m, 1h, 1d
    bucket: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    open: Mapped[float] = mapped_column(Float, nullable=False)
    high: Mapped[float] = mapped_column(Float, nullable=False)
    low: Mapped[float] = mapped_column(Float, nullable=False)
    close: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, default=0)
