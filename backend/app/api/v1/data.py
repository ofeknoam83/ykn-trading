"""Data API endpoints."""

import asyncio
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Query

from app.providers.factory import get_provider
from app.providers.base import AssetClass

router = APIRouter()


def _asset_class_for_symbol(sym: str) -> AssetClass | None:
    """Infer asset class for provider selection. STOCK/ETF use Alpaca when configured."""
    if sym.startswith("^"):
        return AssetClass.INDEX
    if "/" in sym:
        return AssetClass.CRYPTO
    if sym.endswith("-USD"):
        return None
    return AssetClass.STOCK


@router.get("/quotes")
async def get_quotes_batch(
    symbols: str = Query(..., description="Comma-separated symbols e.g. SPY,QQQ,BTC-USD"),
):
    """Get quotes for multiple symbols in one request."""
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]

    async def fetch_one(sym: str):
        try:
            ac = _asset_class_for_symbol(sym)
            provider = get_provider(ac)
            r = await provider.get_quote(sym)
            price = r.get("price", 0)
            change = r.get("change_percent")
            if not price and ac == AssetClass.STOCK:
                yf = get_provider(None)
                r = await yf.get_quote(sym)
                price = r.get("price", 0)
                change = r.get("change_percent")
            return sym, {"price": price, "change_percent": change}
        except Exception:
            try:
                yf = get_provider(None)
                r = await yf.get_quote(sym)
                return sym, {"price": r.get("price", 0), "change_percent": r.get("change_percent")}
            except Exception:
                return sym, {"price": 0, "change_percent": None}

    tasks = [fetch_one(sym) for sym in symbol_list]
    pairs = await asyncio.gather(*tasks)
    results = dict(pairs)
    return {"quotes": results}


@router.get("/quote/{symbol}")
async def get_quote(
    symbol: str,
    asset_class: AssetClass | None = Query(None, description="Asset class for provider selection"),
):
    """Get current quote for symbol."""
    provider = get_provider(asset_class)
    result = await provider.get_quote(symbol)
    return result


@router.get("/historical")
async def get_historical(
    symbol: str = Query(..., description="Symbol (e.g. AAPL, BTC/USDT)"),
    start: date | None = Query(None, description="Start date"),
    end: date | None = Query(None, description="End date"),
    interval: str = Query("1d", description="Interval: 1m, 5m, 15m, 1h, 4h, 1d"),
    asset_class: AssetClass | None = Query(None),
):
    """Get historical OHLCV data."""
    end = end or date.today()
    start = start or (end - timedelta(days=365))
    provider = get_provider(asset_class)
    df = await provider.get_historical(symbol, start, end, interval)
    if df.empty:
        return {"symbol": symbol, "data": []}
    df["bucket"] = df["bucket"].astype(str)
    return {"symbol": symbol, "data": df.to_dict(orient="records")}


@router.get("/search")
async def search_symbols(
    q: str = Query(..., min_length=1),
    asset_class: AssetClass | None = Query(None),
):
    """Search symbols. Autocomplete from providers."""
    provider = get_provider(asset_class)
    results = await provider.search_symbols(q, asset_class)
    return {"results": results}


@router.get("/exchanges")
async def get_exchanges():
    """List supported exchanges."""
    return {
        "exchanges": [
            {"id": "XNAS", "name": "NASDAQ"},
            {"id": "XNYS", "name": "NYSE"},
            {"id": "binance", "name": "Binance"},
        ]
    }
