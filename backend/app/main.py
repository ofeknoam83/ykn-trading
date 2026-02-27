"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    yield
    # Cleanup on shutdown
    from app.core.redis import close_redis
    await close_redis()
    # Close CCXT exchange connections to prevent resource leaks
    from app.providers.factory import _providers
    for provider in _providers.values():
        if hasattr(provider, "close"):
            await provider.close()


app = FastAPI(
    title="YKN Trading API",
    description="Research and trading platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


app.include_router(api_router, prefix="/api/v1")
