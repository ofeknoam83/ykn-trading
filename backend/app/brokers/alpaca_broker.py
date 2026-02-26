"""Alpaca broker - live/paper via Alpaca API."""

from app.config import settings


def _get_alpaca_trading():
    """Lazy init Alpaca trading client."""
    try:
        from alpaca.trading.client import TradingClient
        return TradingClient(
            settings.alpaca_api_key or "",
            settings.alpaca_api_secret or "",
            paper=("paper" in (settings.alpaca_base_url or "").lower()),
        )
    except ImportError:
        return None


class AlpacaBroker:
    """Alpaca broker for live/paper trading."""

    def __init__(self):
        self._client = None

    def _ensure_client(self):
        if self._client is None:
            self._client = _get_alpaca_trading()
        if self._client is None:
            raise ImportError("alpaca-py not installed")

    def _is_configured(self) -> bool:
        return bool(settings.alpaca_api_key and settings.alpaca_api_secret)

    async def get_positions(self) -> list[dict]:
        """Get positions from Alpaca."""
        if not self._is_configured():
            return []

        def _fetch():
            self._ensure_client()
            positions = self._client.get_all_positions()
            return [
                {
                    "symbol": p.symbol,
                    "qty": float(p.qty),
                    "avg_price": float(p.avg_entry_price or 0),
                    "side": p.side.value,
                }
                for p in positions
            ]

        import asyncio
        return await asyncio.to_thread(_fetch)

    async def get_orders(self, status: str | None = None) -> list[dict]:
        """Get orders."""
        if not self._is_configured():
            return []

        def _fetch():
            self._ensure_client()
            orders = self._client.get_orders(status_filter=status)
            return [
                {
                    "id": str(o.id),
                    "symbol": o.symbol,
                    "side": o.side.value,
                    "qty": float(o.qty or 0),
                    "filled_qty": float(o.filled_qty or 0),
                    "status": o.status.value,
                    "filled_avg_price": float(o.filled_avg_price or 0) if o.filled_avg_price else None,
                    "created_at": o.created_at.isoformat() if o.created_at else None,
                }
                for o in orders
            ]

        import asyncio
        return await asyncio.to_thread(_fetch)

    async def place_order(self, symbol: str, side: str, qty: float, order_type: str = "market") -> dict:
        """Place order."""
        if not self._is_configured():
            return {"error": "Alpaca not configured"}

        def _place():
            self._ensure_client()
            from alpaca.trading.requests import MarketOrderRequest
            req = MarketOrderRequest(symbol=symbol, qty=qty, side="buy" if side.lower() == "buy" else "sell")
            o = self._client.submit_order(req)
            return {
                "id": str(o.id),
                "symbol": o.symbol,
                "side": o.side.value,
                "qty": float(o.qty or 0),
                "status": o.status.value,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }

        import asyncio
        return await asyncio.to_thread(_place)

    async def cancel_order(self, order_id: str) -> bool:
        """Cancel order."""
        if not self._is_configured():
            return False

        def _cancel():
            self._ensure_client()
            self._client.cancel_order_by_id(order_id)
            return True

        import asyncio
        try:
            await asyncio.to_thread(_cancel)
            return True
        except Exception:
            return False

    async def get_account(self) -> dict:
        """Get account."""
        if not self._is_configured():
            return {"cash": 0, "equity": 0, "buying_power": 0}

        def _fetch():
            self._ensure_client()
            acc = self._client.get_account()
            return {
                "cash": float(acc.cash or 0),
                "equity": float(acc.equity or 0),
                "buying_power": float(acc.buying_power or 0),
            }

        import asyncio
        return await asyncio.to_thread(_fetch)
