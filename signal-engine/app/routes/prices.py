"""
Live price endpoint — returns current prices for given assets.
Uses CCXT (Binance) for crypto, yfinance for forex/indices/commodities.
No API key needed.
"""
import asyncio
from fastapi import APIRouter, Query
from loguru import logger

from app.analysis.data_provider import data_provider

router = APIRouter()


@router.get("/")
async def get_prices(assets: str = Query(..., description="Comma-separated asset symbols, e.g. EURUSD,BTCUSD,XAUUSD")):
    """
    Get current (latest close) prices for a list of assets.
    Returns a dict mapping asset → price.
    """
    asset_list = [a.strip().upper() for a in assets.split(",") if a.strip()]
    if not asset_list:
        return {"prices": {}}

    # Limit to 30 assets per request
    asset_list = asset_list[:30]

    prices: dict[str, float | None] = {}

    # Fetch all prices concurrently
    async def fetch_price(asset: str) -> tuple[str, float | None]:
        try:
            # Use M5 timeframe - fast to fetch, recent enough for current price
            df = await data_provider.fetch_ohlcv(asset, "M5", limit=5)
            if df is not None and not df.empty:
                return (asset, round(float(df["close"].iloc[-1]), 6))
            # Fallback to H1 if M5 fails (weekends etc.)
            df = await data_provider.fetch_ohlcv(asset, "H1", limit=5)
            if df is not None and not df.empty:
                return (asset, round(float(df["close"].iloc[-1]), 6))
            return (asset, None)
        except Exception as e:
            logger.warning(f"Price fetch error for {asset}: {e}")
            return (asset, None)

    results = await asyncio.gather(*[fetch_price(a) for a in asset_list])
    prices = {asset: price for asset, price in results}

    return {"prices": prices}
