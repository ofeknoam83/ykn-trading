"""Redis connection."""

from collections.abc import AsyncGenerator

from redis.asyncio import Redis

from app.config import settings

_redis: Redis | None = None


async def get_redis() -> AsyncGenerator[Redis, None]:
    """Dependency that yields a Redis client."""
    global _redis
    if _redis is None:
        _redis = Redis.from_url(settings.redis_url, decode_responses=True)
    yield _redis


async def close_redis():
    """Close Redis connection on shutdown."""
    global _redis
    if _redis:
        await _redis.close()
        _redis = None
