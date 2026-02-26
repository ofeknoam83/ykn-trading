"""Database models."""

from app.db.models.ohlcv import OHLCV
from app.db.models.fundamentals import Fundamentals

__all__ = ["OHLCV", "Fundamentals"]
