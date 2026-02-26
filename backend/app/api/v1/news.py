"""News API - real headlines from Finnhub."""

from fastapi import APIRouter, Query

from app.services.news import get_news_feed as fetch_news

router = APIRouter()


@router.get("/feed")
async def get_news_feed(category: str | None = Query(None)):
    """Get real market news from Finnhub. Set FINNHUB_API_KEY in .env."""
    headlines = await fetch_news(category)
    return {"headlines": headlines}


@router.get("/sources")
async def get_news_sources():
    """List news sources."""
    return {"sources": ["Finnhub"]}
