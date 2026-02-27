"""CCXT provider for crypto."""

from datetime import date, datetime, timezone

import pandas as pd

from app.config import settings
from app.providers.base import AssetClass


def _get_ccxt_exchange():
    """Lazy init CCXT exchange."""
    import ccxt.async_support as ccxt
    exchange_id = getattr(ccxt, settings.ccxt_exchange, ccxt.binance)
    return exchange_id(
        {"apiKey": settings.binance_api_key or "", "secret": settings.binance_api_secret or ""}
        if settings.ccxt_exchange == "binance"
        else {}
    )


class CCXTProvider:
    """CCXT provider for crypto (Binance, etc.)."""

    def __init__(self):
        self._exchange = None

    def _ensure_exchange(self):
        if self._exchange is None:
            self._exchange = _get_ccxt_exchange()

    async def close(self):
        """Close the CCXT exchange connection to prevent resource leaks."""
        if self._exchange is not None:
            try:
                await self._exchange.close()
            except Exception:
                pass
            self._exchange = None

    async def get_quote(self, symbol: str) -> dict:
        """Get latest price. Symbol format: BTC/USDT."""
        self._ensure_exchange()
        try:
            ticker = await self._exchange.fetch_ticker(symbol)
            return {
                "symbol": symbol,
                "price": float(ticker.get("last", 0)),
                "change": float(ticker.get("change", 0)) if ticker.get("change") else None,
                "change_percent": float(ticker.get("percentage", 0)) if ticker.get("percentage") else None,
                "volume": int(ticker.get("baseVolume", 0)) if ticker.get("baseVolume") else None,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        except Exception as e:
            return {"symbol": symbol, "price": 0.0, "error": str(e)}

    async def get_historical(
        self,
        symbol: str,
        start: date,
        end: date,
        interval: str = "1d",
    ) -> pd.DataFrame:
        """Get OHLCV candles."""
        self._ensure_exchange()
        try:
            since = int(pd.Timestamp(start).timestamp() * 1000)
            tf = {"1m": "1m", "5m": "5m", "15m": "15m", "1h": "1h", "4h": "4h", "1d": "1d"}.get(interval, "1d")
            ohlcv = await self._exchange.fetch_ohlcv(symbol, timeframe=tf, since=since, limit=1000)
            rows = []
            for o in ohlcv:
                ts = pd.to_datetime(o[0], unit="ms")
                if ts.date() > end:
                    break
                rows.append({
                    "symbol": symbol,
                    "open": o[1],
                    "high": o[2],
                    "low": o[3],
                    "close": o[4],
                    "volume": o[5],
                    "bucket": ts,
                })
            return pd.DataFrame(rows)
        except Exception:
            return pd.DataFrame()

    async def search_symbols(self, query: str, asset_class: AssetClass | None = None) -> list[dict]:
        """List markets, filter by query."""
        self._ensure_exchange()
        try:
            markets = await self._exchange.load_markets()
            q = query.upper()
            results = []
            for sym, m in markets.items():
                if q in sym and m.get("active", True):
                    results.append({
                        "symbol": sym,
                        "name": m.get("base", sym),
                        "asset_class": "crypto",
                        "exchange": settings.ccxt_exchange,
                    })
                if len(results) >= 20:
                    break
            return results
        except Exception:
            return []
