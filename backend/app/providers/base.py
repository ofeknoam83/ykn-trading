"""Data provider protocol and types."""

from datetime import date
from enum import Enum
from typing import Protocol

import pandas as pd


class AssetClass(str, Enum):
    """Asset class for provider selection."""

    STOCK = "stock"
    ETF = "etf"
    CRYPTO = "crypto"
    INDEX = "index"
    OPTION = "option"


class DataProvider(Protocol):
    """Protocol for data providers - all implement this interface."""

    async def get_quote(self, symbol: str) -> dict:
        """Get current quote for symbol. Returns dict with price, change, etc."""
        ...

    async def get_historical(
        self,
        symbol: str,
        start: date,
        end: date,
        interval: str = "1d",
    ) -> pd.DataFrame:
        """Get historical OHLCV data."""
        ...

    async def search_symbols(self, query: str, asset_class: AssetClass | None = None) -> list[dict]:
        """Search symbols by query. Returns list of SymbolInfo dicts."""
        ...
