"""YFinance provider for stocks, ETFs, indices."""

import asyncio
from datetime import date

import pandas as pd
import yfinance as yf

from app.providers.base import AssetClass


class YFinanceProvider:
    """YFinance provider - free, no auth. Stocks, ETFs, indices."""

    async def get_quote(self, symbol: str) -> dict:
        """Get latest quote from Yahoo Finance."""

        def _fetch():
            t = yf.Ticker(symbol)
            info = t.info
            h = t.history(period="1d")
            price = float(info.get("regularMarketPrice") or info.get("currentPrice") or 0)
            prev = float(info.get("previousClose") or 0)
            change = (price - prev) if prev else None
            change_pct = (change / prev * 100) if prev and prev else None
            vol = h["Volume"].iloc[-1] if not h.empty and "Volume" in h.columns else None
            return {
                "symbol": symbol,
                "price": price,
                "change": change,
                "change_percent": change_pct,
                "volume": int(vol) if vol and not pd.isna(vol) else None,
                "timestamp": None,
            }

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
        """Get historical OHLCV from YFinance."""

        def _fetch():
            t = yf.Ticker(symbol)
            df = t.history(start=start, end=end, interval=interval or "1d")
            if df.empty:
                return pd.DataFrame()
            df = df.reset_index()
            df = df.rename(columns={"Date": "bucket"})
            df["symbol"] = symbol
            return df[["symbol", "Open", "High", "Low", "Close", "Volume", "bucket"]].rename(
                columns={"Open": "open", "High": "high", "Low": "low", "Close": "close", "Volume": "volume"}
            )

        try:
            return await asyncio.to_thread(_fetch)
        except Exception:
            return pd.DataFrame()

    async def search_symbols(self, query: str, asset_class: AssetClass | None = None) -> list[dict]:
        """Use yfinance tickers or a simple search."""

        def _fetch():
            try:
                result = yf.Ticker(query)  # Can also use yf.search
                info = result.info
                return [
                    {
                        "symbol": info.get("symbol", query),
                        "name": info.get("shortName", info.get("longName", query)),
                        "asset_class": "stock",
                        "exchange": info.get("exchange"),
                    }
                ]
            except Exception:
                return [{"symbol": query.upper(), "name": query, "asset_class": "stock", "exchange": None}]

        return await asyncio.to_thread(_fetch)
