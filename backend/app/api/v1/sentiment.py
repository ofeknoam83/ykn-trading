"""Sentiment API - news, social, institutional flow, earnings. Stub implementation."""

from datetime import datetime
from uuid import UUID, uuid4

from fastapi import APIRouter, Query

router = APIRouter()


def _now() -> str:
    return datetime.utcnow().isoformat() + "Z"


# ─── Dashboard ───


@router.get("/dashboard")
async def get_sentiment_dashboard():
    """Sentiment dashboard overview."""
    return {
        "mood": {
            "overallSentiment": 55,
            "overallLabel": "Neutral",
            "fearGreedIndex": 55,
            "newsTone": 50,
            "socialBuzz": 50,
            "institutionalFlow": 0,
            "institutionalFlowLabel": "Neutral",
            "vix": 14.5,
            "vixChange": -0.3,
        },
        "movers": {"positive": [], "negative": []},
        "sectorHeatmap": [],
        "catalysts": [],
    }


@router.get("/movers")
async def get_sentiment_movers():
    """Top positive and negative sentiment movers."""
    return {"positive": [], "negative": []}


@router.get("/sector-heatmap")
async def get_sector_heatmap():
    """Sector sentiment heatmap."""
    return []


# ─── News ───


@router.get("/news/feed")
async def get_news_feed(
    topic: str | None = None,
    source: str | None = None,
    sentiment: str | None = None,
    symbol: str | None = None,
):
    """News sentiment feed."""
    return []


@router.get("/news/series/{symbol}")
async def get_news_series(symbol: str, interval: str = "1h"):
    """News sentiment time series for symbol."""
    return []


@router.get("/news/{article_id}/impact")
async def get_news_impact(article_id: str):
    """Impact analysis for a news article."""
    return {
        "articleId": article_id,
        "title": "",
        "historicalPrecedent": {
            "similarEvents": 0,
            "avgFiveDayImpact": 0,
            "description": "",
        },
        "affectedEntities": [],
        "marketContext": [],
    }


# ─── Social ───


@router.get("/social/{symbol}")
async def get_social_metrics(symbol: str, window: str = "1h"):
    """Social metrics for symbol."""
    return {
        "symbol": symbol,
        "timestamp": _now(),
        "window": window,
        "mentionCount": 0,
        "relativeVolume": 0,
        "volumeAcceleration": 0,
        "bullishPct": 50,
        "bearishPct": 50,
        "neutralPct": 0,
        "sentimentScore": 50,
        "sentimentShift": 0,
        "platformBreakdown": [],
        "avgAccountAge": 0,
        "botFilteredPct": 0,
        "avgEngagement": 0,
        "topKeywords": [],
        "dominantNarrative": "",
    }


@router.get("/social/trending")
async def get_trending_social():
    """Trending social symbols."""
    return []


@router.get("/social/{symbol}/history")
async def get_social_history(symbol: str):
    """Social metrics history for symbol."""
    return []


# ─── Institutional ───


@router.get("/institutional/{symbol}")
async def get_institutional_flow(symbol: str):
    """Institutional flow for symbol."""
    return {
        "ownership": {
            "totalInstitutionalShares": 0,
            "institutionalPct": 0,
            "quarterlyChange": 0,
            "netBuyers": 0,
            "netSellers": 0,
        },
        "recentInsider": [],
        "optionsFlow": [],
        "darkPool": {
            "symbol": symbol,
            "date": _now()[:10],
            "totalDarkVolume": 0,
            "darkPoolPct": 0,
            "avgPrintSize": 0,
            "largePrints": 0,
            "netSentiment": 0,
            "shortExemptVolume": 0,
            "shortPctOfVolume": 0,
        },
    }


@router.get("/13f/recent")
async def get_recent_13f():
    """Recent 13F filings."""
    return []


@router.get("/13f/{symbol}")
async def get_13f_by_symbol(symbol: str):
    """13F filings for symbol."""
    return []


@router.get("/insider/{symbol}")
async def get_insider_transactions(symbol: str):
    """Insider transactions for symbol."""
    return []


@router.get("/insider/clusters")
async def get_insider_clusters():
    """Insider transaction clusters."""
    return []


@router.get("/options-flow")
async def get_options_flow_all():
    """Options flow (all symbols)."""
    return []


@router.get("/options-flow/{symbol}")
async def get_options_flow_by_symbol(symbol: str):
    """Options flow for symbol."""
    return []


@router.get("/dark-pool/{symbol}")
async def get_dark_pool(symbol: str):
    """Dark pool summary for symbol."""
    return {
        "symbol": symbol,
        "date": _now()[:10],
        "totalDarkVolume": 0,
        "darkPoolPct": 0,
        "avgPrintSize": 0,
        "largePrints": 0,
        "netSentiment": 0,
        "shortExemptVolume": 0,
        "shortPctOfVolume": 0,
    }


# ─── Earnings ───


@router.get("/earnings/calendar")
async def get_earnings_calendar(
    start: str | None = None,
    end: str | None = None,
    watchlist_only: bool | None = None,
):
    """Earnings calendar."""
    return []


@router.get("/earnings/{symbol}")
async def get_earnings_profile(symbol: str):
    """Earnings profile for symbol."""
    return {
        "symbol": symbol,
        "nextEarningsDate": "",
        "nextEarningsTime": "after_close",
        "daysUntilEarnings": 0,
        "epsEstimate": 0,
        "epsWhisper": None,
        "revenueEstimate": 0,
        "revenueWhisper": None,
        "estimateRevisions": {"epsUp": 0, "epsDown": 0, "revenueUp": 0, "revenueDown": 0},
        "beatRate": {"eps": {"beats": 0, "misses": 0, "total": 0, "pct": 0}, "revenue": {"beats": 0, "misses": 0, "total": 0, "pct": 0}},
        "avgSurprise": {"eps": 0, "revenue": 0},
        "avgPostEarningsMove": 0,
        "avgBeatReaction": 0,
        "avgMissReaction": 0,
        "postEarningsDrift": {"day5": 0, "day10": 0, "day20": 0},
        "impliedMove": 0,
        "historicalAvgMove": 0,
        "impliedVsRealized": 0,
        "preEarningsSentiment": 0,
        "analystRevisionTrend": "flat",
        "earningsScore": 0,
        "earningsScoreLabel": "",
    }


@router.post("/earnings/{symbol}/backtest")
async def run_earnings_backtest(symbol: str, body: dict):
    """Run earnings play backtest."""
    play_type = body.get("playType", "post_earnings_drift")
    return {
        "playType": play_type,
        "winRate": 0,
        "avgReturn": 0,
        "maxDrawdown": 0,
        "trades": [],
    }


# ─── Events ───


@router.get("/events/timeline")
async def get_event_timeline(
    symbol: str | None = None,
    type: str | None = None,
):
    """Event timeline."""
    return []


def _is_uuid_like(s: str) -> bool:
    """Check if string looks like a UUID. Symbols are typically 1-6 chars; UUIDs are 36."""
    try:
        UUID(s)
        return True
    except (ValueError, TypeError):
        return False


@router.get("/events/{symbol_or_id}")
async def get_events_or_detail(symbol_or_id: str):
    """Events by symbol (returns list) or event detail by ID (returns single object)."""
    if _is_uuid_like(symbol_or_id):
        return {
            "id": symbol_or_id,
            "type": "macro_data",
            "affectedSymbols": [],
            "title": "",
            "description": "",
            "source": "",
            "detectedAt": _now(),
            "status": "resolved",
            "confidence": 0,
            "sentimentImpact": 0,
        }
    return []


# ─── Profile ───


@router.get("/profile/{symbol}")
async def get_entity_profile(symbol: str):
    """Composite sentiment profile for symbol."""
    return {
        "symbol": symbol,
        "timestamp": _now(),
        "composite": 50,
        "components": {
            "news": 50,
            "social": 50,
            "institutional": 50,
            "options": 50,
            "earnings": 50,
            "event": 50,
        },
        "convergenceScore": 0,
        "convergenceType": "neutral",
    }


@router.get("/profile/{symbol}/composite")
async def get_entity_composite(symbol: str):
    """Entity composite sentiment."""
    return {
        "symbol": symbol,
        "timestamp": _now(),
        "composite": 50,
        "components": {
            "news": 50,
            "social": 50,
            "institutional": 50,
            "options": 50,
            "earnings": 50,
            "event": 50,
        },
        "convergenceScore": 0,
        "convergenceType": "neutral",
    }


@router.get("/profile/{symbol}/effectiveness")
async def get_effectiveness_analysis(symbol: str):
    """Sentiment effectiveness analysis."""
    return {
        "symbol": symbol,
        "period": "1Y",
        "indicators": [],
        "keyFinding": "",
        "recommendation": "",
    }


# ─── Alerts ───


@router.get("/alerts")
async def get_sentiment_alerts(page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=100)):
    """Sentiment alerts."""
    return {"alerts": [], "total": 0}


@router.post("/alerts/configure")
async def configure_sentiment_alert(body: dict):
    """Configure sentiment alert."""
    return body


@router.post("/alerts/{alert_id}/read")
async def mark_sentiment_alert_read(alert_id: str):
    """Mark sentiment alert as read."""
    return None


# ─── Watchlist ───


@router.get("/watchlist")
async def get_sentiment_watchlist():
    """Sentiment watchlist."""
    return []


@router.post("/watchlist/{symbol}")
async def add_to_watchlist(symbol: str):
    """Add symbol to watchlist."""
    return {
        "symbol": symbol,
        "composite": 50,
        "news": 50,
        "social": 50,
        "institutional": 50,
        "change24h": 0,
        "hasAlert": False,
    }


@router.delete("/watchlist/{symbol}")
async def remove_from_watchlist(symbol: str):
    """Remove symbol from watchlist."""
    return None


# ─── Indicators ───


@router.get("/indicators")
async def get_sentiment_indicators():
    """List sentiment indicator definitions."""
    return []


@router.get("/indicators/{code}/values")
async def get_sentiment_indicator_values(
    code: str,
    symbol: str = Query(...),
    from_: str = Query(..., alias="from"),
    to: str = Query(...),
    interval: str = Query(...),
):
    """Get indicator values for a symbol."""
    return []
