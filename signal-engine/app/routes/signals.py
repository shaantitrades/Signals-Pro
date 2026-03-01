"""Signal generation routes — optimized for rapid signal detection."""
import asyncio
from fastapi import APIRouter, HTTPException
from loguru import logger

from app.analysis.data_provider import data_provider
from app.analysis.technical import analyzer
from app.config import settings
from app.models import AssetCategory, Timeframe

router = APIRouter()

# Assets available for analysis
ASSETS = {
    AssetCategory.FOREX_OTC: [
        "EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC", "USDCHF_OTC", "AUDUSD_OTC", "USDCAD_OTC", "NZDUSD_OTC",
        "EURGBP_OTC", "EURJPY_OTC", "GBPJPY_OTC", "EURAUD_OTC", "EURCAD_OTC", "EURCHF_OTC", "EURNZD_OTC",
        "GBPAUD_OTC", "GBPCAD_OTC", "GBPCHF_OTC", "GBPNZD_OTC", "AUDCAD_OTC", "AUDCHF_OTC",
        "AUDJPY_OTC", "AUDNZD_OTC", "CADJPY_OTC", "CADCHF_OTC", "CHFJPY_OTC", "NZDJPY_OTC", "NZDCAD_OTC",
    ],
    AssetCategory.FOREX: [
        "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
        "EURGBP", "EURJPY", "GBPJPY", "EURAUD", "EURCAD", "EURCHF", "EURNZD",
        "GBPAUD", "GBPCAD", "GBPCHF", "GBPNZD",
        "AUDCAD", "AUDCHF", "AUDJPY", "AUDNZD",
        "CADJPY", "CADCHF", "CHFJPY", "NZDJPY", "NZDCAD", "NZDCHF",
    ],
    AssetCategory.CRYPTO: [
        "BTCUSD", "ETHUSD", "BNBUSD", "SOLUSD", "XRPUSD", "ADAUSD",
        "DOTUSD", "DOGEUSD", "AVAXUSD", "LINKUSD", "MATICUSD", "UNIUSD",
        "ATOMUSD", "LTCUSD", "NEARUSD", "APTUSD", "ARBUSD", "OPUSD",
        "FILUSD", "TRXUSD", "SHIBUSD", "XLMUSD", "ALGOUSD",
    ],
    AssetCategory.INDICES: [
        "US30", "US500", "USTEC", "DE40", "UK100", "JP225",
        "FR40", "EU50", "AU200", "HK50", "CN50", "ES35",
        "IT40", "NL25", "CH20", "VIX", "US2000", "SG30",
    ],
    AssetCategory.COMMODITIES: [
        "XAUUSD", "XAGUSD", "USOIL", "UKOIL", "NATGAS", "COPPER",
        "XPTUSD", "XPDUSD", "WHEAT", "CORN", "SOYBEAN", "COFFEE",
        "SUGAR", "COTTON", "COCOA", "LUMBER",
    ],
}


@router.get("/generate/{category}/{asset}/{timeframe}")
async def generate_signal(category: AssetCategory, asset: str, timeframe: Timeframe):
    """Generate a signal for a specific asset and timeframe."""
    if asset not in ASSETS.get(category, []):
        raise HTTPException(status_code=400, detail=f"Asset {asset} not available in {category}")

    df = await data_provider.fetch_ohlcv(asset, timeframe.value, limit=100)
    if df is None or df.empty:
        raise HTTPException(status_code=503, detail=f"No market data for {asset}")

    result = analyzer.analyze(df, asset, category, timeframe)
    if result is None:
        return {"signal": None, "message": "No valid signal found"}

    return {"signal": result.model_dump()}


@router.get("/fast/{category}/{asset}/{timeframe}")
async def fast_signal(category: AssetCategory, asset: str, timeframe: Timeframe):
    """
    Fast signal generation on the REQUESTED timeframe only.
    Returns None if no high-confidence signal is found — does NOT fall back to other timeframes.
    Primary use: Forex OTC "Start Signals" feature.
    """
    if asset not in ASSETS.get(category, []):
        raise HTTPException(status_code=400, detail=f"Asset {asset} not available in {category}")

    # Use appropriate confidence threshold based on asset class
    min_conf = settings.otc_min_confidence if category == AssetCategory.FOREX_OTC else settings.signal_min_confidence

    # Only analyze the REQUESTED timeframe — no silent fallback to other timeframes
    try:
        df = await data_provider.fetch_ohlcv(asset, timeframe.value, limit=100)
        if df is None or df.empty:
            return {"signal": None, "message": f"No market data for {asset}/{timeframe.value}", "fast_mode": True}

        result = analyzer.analyze(df, asset, category, timeframe)
        if result and result.confidence >= min_conf:
            return {
                "signal": result.model_dump(),
                "source_timeframe": timeframe.value,
                "fast_mode": True,
            }
    except Exception as e:
        logger.error(f"Fast signal error {asset}/{timeframe}: {e}")
        return {"signal": None, "message": "Analysis error", "fast_mode": True}

    return {"signal": None, "message": f"No strong signal found for {asset} on {timeframe.value}", "fast_mode": True}


@router.get("/scan/{category}/{timeframe}")
async def scan_category(category: AssetCategory, timeframe: Timeframe, min_confidence: float = 80):
    """Scan all assets in a category for signals."""
    assets = ASSETS.get(category, [])
    signals = []

    for asset in assets:
        try:
            df = await data_provider.fetch_ohlcv(asset, timeframe.value, limit=100)
            if df is None or df.empty:
                continue
            result = analyzer.analyze(df, asset, category, timeframe)
            if result and result.confidence >= min_confidence:
                signals.append(result.model_dump())
        except Exception as e:
            logger.error(f"Error scanning {asset}: {e}")

    return {
        "category": category,
        "timeframe": timeframe,
        "signals_found": len(signals),
        "signals": sorted(signals, key=lambda s: s["confidence"], reverse=True),
    }


@router.get("/assets")
async def list_assets():
    """List all available assets grouped by category."""
    return {"assets": {cat.value: assets for cat, assets in ASSETS.items()}}
