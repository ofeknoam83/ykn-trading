"""Alpaca data provider for US equities."""

import asyncio
from datetime import date, datetime

import pandas as pd

from app.config import settings
from app.providers.base import AssetClass


def _get_alpaca_client():
    """Lazy init Alpaca data client."""
    try:
        from alpaca.data.historical import StockHistoricalDataClient
        from alpaca.data.requests import StockLatestQuoteRequest, StockBarsRequest
        from alpaca.data.timeframe import TimeFrame

        return StockHistoricalDataClient(
            settings.alpaca_api_key or "demo",
            settings.alpaca_api_secret or "demo",
        ), StockLatestQuoteRequest, StockBarsRequest, TimeFrame
    except ImportError:
        return None


class AlpacaProvider:
    """Alpaca provider for live US equity data."""

    def __init__(self):
        self._client = None
        self._req = None
        self._bars_req = None
        self._tf = None

    def _ensure_client(self):
        if self._client is None:
            result = _get_alpaca_client()
            if result:
                self._client, self._req, self._bars_req, self._tf = result
            else:
                raise ImportError("alpaca-py not installed")

    def _is_configured(self) -> bool:
        return bool(settings.alpaca_api_key and settings.alpaca_api_secret)

    async def get_quote(self, symbol: str) -> dict:
        """Get latest quote from Alpaca."""
        if not self._is_configured():
            return {"symbol": symbol, "price": 0.0, "error": "Alpaca not configured"}

        def _fetch():
            self._ensure_client()
            req = self._req(symbol_or_symbols=symbol)
            quote = self._client.get_stock_latest_quote(req)
            if quote and symbol in quote:
                q = quote[symbol]
                return {
                    "symbol": symbol,
                    "price": float(q.ask_price or q.bid_price or 0),
                    "change": None,
                    "change_percent": None,
                    "volume": int(q.ask_size or 0) + int(q.bid_size or 0),
                    "timestamp": q.timestamp.isoformat() if q.timestamp else None,
                }
            return {"symbol": symbol, "price": 0.0, "change": None, "change_percent": None}

        try:
            return await asyncio.to_thread(_fetch)
        except Exception as e:
            return {"symbol": symbol, "price": 0.0, "error": str(e)}

    async def get_historical(
        self,
        symbol: str,
        start: date,
        end: date,
        interval: str = "1d",
    ) -> pd.DataFrame:
        """Get historical bars from Alpaca."""
        if not self._is_configured():
            return pd.DataFrame()

        def _fetch():
            self._ensure_client()
            tf_map = {"1m": self._tf.Minute, "5m": self._tf(5, "Min"), "1h": self._tf.Hour, "1d": self._tf.Day}
            tf = tf_map.get(interval, self._tf.Day)
            req = self._bars_req(symbol_or_symbols=symbol, start=start, end=end, timeframe=tf)
            bars = self._client.get_stock_bars(req)
            if not bars or symbol not in bars.data:
                return pd.DataFrame()
            data = bars.data[symbol]
            rows = []
            for b in data:
                rows.append({
                    "symbol": symbol,
                    "open": float(b.open),
                    "high": float(b.high),
                    "low": float(b.low),
                    "close": float(b.close),
                    "volume": int(b.volume),
                    "bucket": b.timestamp,
                })
            return pd.DataFrame(rows)

        try:
            return await asyncio.to_thread(_fetch)
        except Exception:
            return pd.DataFrame()

    async def search_symbols(self, query: str, asset_class: AssetClass | None = None) -> list[dict]:
        """Alpaca doesn't provide search - return empty."""
        return []
