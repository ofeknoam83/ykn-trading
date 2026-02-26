"""Portfolio API endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel

from app.brokers.paper_broker import PaperBroker

router = APIRouter()

# Use paper broker when Alpaca not configured; else could switch via config
_broker = PaperBroker()


class OrderRequest(BaseModel):
    """Order request body."""

    symbol: str
    side: str  # buy | sell
    qty: float
    order_type: str = "market"


@router.get("/positions")
async def get_positions():
    """Get current positions."""
    positions = await _broker.get_positions()
    return {"positions": positions}


@router.get("/account")
async def get_account():
    """Get account summary."""
    account = await _broker.get_account()
    return account


@router.get("/orders")
async def get_orders(status: str | None = None):
    """Get orders, optionally filtered by status."""
    orders = await _broker.get_orders(status)
    return {"orders": orders}


@router.post("/orders")
async def place_order(req: OrderRequest):
    """Place an order."""
    order = await _broker.place_order(req.symbol, req.side, req.qty, req.order_type)
    return order
