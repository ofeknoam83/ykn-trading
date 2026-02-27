"""Paper broker - simulated trading with Redis storage."""

import json
from datetime import datetime, timezone

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
        old_qty = p["qty"]
        old_avg = p["avg_price"]
        sign = 1 if side.lower() == "buy" else -1
        new_qty = old_qty + sign * qty
        cost = qty * price * sign
        self._cash -= cost
        if new_qty == 0:
            del self._positions[symbol]
        else:
            # Compute weighted average price when adding to a position
            if sign > 0 and old_qty >= 0 and new_qty > 0:
                # Buying more of a long position
                p["avg_price"] = (old_qty * old_avg + qty * price) / new_qty
            elif sign < 0 and old_qty <= 0 and new_qty < 0:
                # Selling more of a short position
                p["avg_price"] = (abs(old_qty) * old_avg + qty * price) / abs(new_qty)
            else:
                # Reducing or flipping position - use new fill price
                p["avg_price"] = price
            p["qty"] = new_qty
        order = {
            "id": order_id,
            "symbol": symbol,
            "side": side,
            "qty": qty,
            "filled_qty": qty,
            "status": "filled",
            "filled_avg_price": price,
            "created_at": datetime.now(timezone.utc).isoformat(),
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
