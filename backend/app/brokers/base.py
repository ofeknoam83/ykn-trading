"""Broker protocol."""

from typing import Protocol


class Broker(Protocol):
    """Protocol for brokers."""

    async def get_positions(self) -> list[dict]:
        """Get current positions."""
        ...

    async def get_orders(self, status: str | None = None) -> list[dict]:
        """Get orders, optionally filtered by status."""
        ...

    async def place_order(self, symbol: str, side: str, qty: float, order_type: str = "market") -> dict:
        """Place an order."""
        ...

    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an order."""
        ...

    async def get_account(self) -> dict:
        """Get account info."""
        ...
