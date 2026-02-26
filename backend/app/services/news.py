"""News aggregation - Finnhub (API key) or yfinance (no key)."""

import asyncio
from typing import Any

import httpx
import yfinance as yf

from app.config import settings


async def fetch_finnhub_news(category: str = "general", limit: int = 20) -> list[dict[str, Any]]:
    """Fetch real market news from Finnhub. Free API key at finnhub.io."""
    if not settings.finnhub_api_key:
        return []

    url = "https://finnhub.io/api/v1/news"
    params = {"category": category, "token": settings.finnhub_api_key}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return []

    if not isinstance(data, list):
        return []

    headlines = []
    seen = set()
    for item in data[:limit]:
        title = item.get("headline") or item.get("title") or ""
        if not title or title in seen:
            continue
        seen.add(title)
        headlines.append({
            "title": str(title)[:300],
            "source": item.get("source", "Finnhub"),
            "timestamp": str(item.get("datetime", "")),
            "url": item.get("url", "#") or "#",
            "image": item.get("image") or None,
        })
    return headlines


def _fetch_yfinance_news(limit: int = 15) -> list[dict[str, Any]]:
    """Fetch market news from yfinance (no API key needed). Uses SPY for broad market."""
    def _sync():
        headlines = []
        seen = set()
        for symbol in ["SPY", "QQQ", "AAPL"]:
            try:
                t = yf.Ticker(symbol)
                news = t.get_news() if hasattr(t, "get_news") else getattr(t, "news", []) or []
                for n in news:
                    c = n.get("content") if isinstance(n.get("content"), dict) else n
                    title = c.get("title", "")
                    if not title or title in seen:
                        continue
                    seen.add(title)
                    provider = c.get("provider") or {}
                    source = provider.get("displayName", "Yahoo") if isinstance(provider, dict) else "Yahoo"
                    url_obj = c.get("canonicalUrl") or c.get("clickThroughUrl") or {}
                    url = url_obj.get("url", "#") if isinstance(url_obj, dict) else "#"
                    thumb = c.get("thumbnail") or {}
                    image = thumb.get("originalUrl") if isinstance(thumb, dict) else None
                    headlines.append({
                        "title": str(title)[:300],
                        "source": source,
                        "timestamp": c.get("pubDate", "") or "",
                        "url": url or "#",
                        "image": image,
                    })
                    if len(headlines) >= limit:
                        return headlines
            except Exception:
                continue
        return headlines

    return _sync()


async def get_news_feed(category: str | None = None) -> list[dict[str, Any]]:
    """Get real market news. Finnhub if key set, else yfinance."""
    cat = category or "general"
    headlines = await fetch_finnhub_news(category=cat)
    if headlines:
        return headlines
    # Fallback: yfinance (no API key)
    return await asyncio.to_thread(_fetch_yfinance_news)
