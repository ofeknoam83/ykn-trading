"""API v1 router - mounts all v1 endpoints."""

from fastapi import APIRouter

from app.api.v1 import data, health, portfolio, backtest, jobs, llm, agents, news, scanner, sentiment

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(data.router, prefix="/data", tags=["data"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
api_router.include_router(backtest.router, prefix="/backtest", tags=["backtest"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(llm.router, prefix="/llm", tags=["llm"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(scanner.router, prefix="/scanner", tags=["scanner"])
api_router.include_router(sentiment.router, prefix="/sentiment", tags=["sentiment"])
