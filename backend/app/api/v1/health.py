"""Health check endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def health_check():
    """Basic health check."""
    return {"status": "ok"}


@router.get("/db")
async def health_db():
    """Database health - placeholder, wire to get_db when ready."""
    return {"status": "ok", "message": "DB check not yet implemented"}


@router.get("/redis")
async def health_redis():
    """Redis health - placeholder, wire to get_redis when ready."""
    return {"status": "ok", "message": "Redis check not yet implemented"}
