"""Paper broker - simulated trading with Redis storage."""

import json
from datetime import datetime

from app.config import settings


class PaperBroker:
    """In-memory paper broker. Uses Redis for persistence if available."""

    def __init__(self):
        self._positions: dict[str, dict] = {}  # symbol -> {qty, avg_price}
        self._orders: dict[str, dict] = {}
        self._cash = 100_000.0  # Starting paper cash
        self._order_id = 0

    async def get_positions(self) -> list[dict]:
        """Get current positions."""
        return [
            {"symbol": s, "qty": p["qty"], "avg_price": p["avg_price"], "side": "long" if p["qty"] > 0 else "short"}
            for s, p in self._positions.items()
            if p["qty"] != 0
        ]

    async def get_orders(self, status: str | None = None) -> list[dict]:
        """Get orders."""
        orders = list(self._orders.values())
        if status:
            orders = [o for o in orders if o.get("status") == status]
        return orders

    async def place_order(self, symbol: str, side: str, qty: float, order_type: str = "market") -> dict:
        """Place paper order - simulate fill at current price (simplified: use last known)."""
        self._order_id += 1
        order_id = f"paper-{self._order_id}"
        # Simplified: assume fill at qty * 100 (placeholder price)
        price = 100.0  # In real impl, get from quote
        self._positions.setdefault(symbol, {"qty": 0, "avg_price": 0})
        p = self._positions[symbol]
        sign = 1 if side.lower() == "buy" else -1
        new_qty = p["qty"] + sign * qty
        cost = qty * price * sign
        self._cash -= cost
        if new_qty == 0:
            del self._positions[symbol]
        else:
            p["qty"] = new_qty
            p["avg_price"] = price
        order = {
            "id": order_id,
            "symbol": symbol,
            "side": side,
            "qty": qty,
            "filled_qty": qty,
            "status": "filled",
            "filled_avg_price": price,
            "created_at": datetime.utcnow().isoformat(),
        }
        self._orders[order_id] = order
        return order

    async def cancel_order(self, order_id: str) -> bool:
        """Cancel order - only pending."""
        if order_id in self._orders and self._orders[order_id].get("status") == "pending":
            self._orders[order_id]["status"] = "cancelled"
            return True
        return False

    async def get_account(self) -> dict:
        """Get account summary."""
        positions = await self.get_positions()
        equity = self._cash + sum(abs(p["qty"]) * p["avg_price"] for p in positions)
        return {
            "cash": self._cash,
            "equity": equity,
            "buying_power": self._cash,
        }
