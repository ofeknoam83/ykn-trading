"""Provider factory - select provider by asset class."""

from app.providers.base import AssetClass
from app.providers.alpaca import AlpacaProvider
from app.providers.stocks import YFinanceProvider
from app.providers.crypto import CCXTProvider


_providers = {
    AssetClass.STOCK: AlpacaProvider(),
    AssetClass.ETF: AlpacaProvider(),
    AssetClass.INDEX: YFinanceProvider(),
    AssetClass.CRYPTO: CCXTProvider(),
}


def get_provider(asset_class: AssetClass | None = None):
    """Get provider for asset class. Default to YFinance for flexibility."""
    if asset_class and asset_class in _providers:
        return _providers[asset_class]
    return YFinanceProvider()
