"""Signal generation routes — optimized for rapid signal detection."""
import asyncio
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from fastapi import APIRouter, HTTPException
from loguru import logger

from app.analysis.data_provider import data_provider
from app.analysis.technical import analyzer
from app.analysis.deepseek_validator import validate_signal, get_deepseek_status
from app.config import settings
from app.models import AssetCategory, Timeframe

router = APIRouter()


@router.get("/deepseek-status")
async def deepseek_status():
    """Return DeepSeek AI availability status for the admin panel."""
    return get_deepseek_status()


def is_market_open(category: AssetCategory) -> bool:
    """Return True if the given market category is currently open (Paris time)."""
    paris = ZoneInfo("Europe/Paris")
    now = datetime.now(paris)
    day = now.weekday()  # 0=Mon … 6=Sun
    h, m = now.hour, now.minute
    t = h + m / 60
    is_weekend = day >= 5  # Sat=5, Sun=6
    is_friday = day == 4

    if category in (AssetCategory.CRYPTO, AssetCategory.FOREX_OTC):
        return True
    if category == AssetCategory.FOREX:
        if is_weekend and not (day == 6 and h >= 23):
            return False
        if is_friday and h >= 23:
            return False
        return True
    if category == AssetCategory.INDICES:
        if is_weekend:
            return False
        if t < 8 or t >= 22.5:
            return False
        return True
    if category == AssetCategory.COMMODITIES:
        if is_weekend:
            return False
        if t < 1 or t >= 22:
            return False
        return True
    return True


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
    if not is_market_open(category):
        return {"signal": None, "message": f"Market {category.value} is closed (weekend or off-hours)"}
    if asset not in ASSETS.get(category, []):
        raise HTTPException(status_code=400, detail=f"Asset {asset} not available in {category}")

    df = await data_provider.fetch_ohlcv(asset, timeframe.value, limit=100)
    if df is None or df.empty:
        raise HTTPException(status_code=503, detail=f"No market data for {asset}")

    result = analyzer.analyze(df, asset, category, timeframe)
    if result is None:
        return {"signal": None, "message": "No valid signal found"}

    ai_confirmed, ai_reason = await validate_signal(result)
    if not ai_confirmed:
        logger.info(f"AI rejected signal for {asset}: {ai_reason}")
        return {"signal": None, "message": f"Signal rejected by AI: {ai_reason}", "ai_validated": False}

    return {"signal": result.model_dump(), "ai_validated": True, "ai_reasoning": ai_reason}


@router.get("/fast/{category}/{asset}/{timeframe}")
async def fast_signal(category: AssetCategory, asset: str, timeframe: Timeframe):
    """
    Fast signal generation on the REQUESTED timeframe only.
    Returns None if no high-confidence signal is found — does NOT fall back to other timeframes.
    Primary use: Forex OTC "Start Signals" feature.
    """
    if not is_market_open(category):
        return {"signal": None, "message": f"Market {category.value} is closed (weekend or off-hours)", "fast_mode": True}
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
            ai_confirmed, ai_reason = await validate_signal(result)
            if not ai_confirmed:
                logger.info(f"AI rejected fast signal for {asset}/{timeframe}: {ai_reason}")
                return {"signal": None, "message": f"Signal rejected by AI: {ai_reason}", "fast_mode": True, "ai_validated": False}

            return {
                "signal": result.model_dump(),
                "source_timeframe": timeframe.value,
                "fast_mode": True,
                "ai_validated": True,
                "ai_reasoning": ai_reason,
            }
    except Exception as e:
        logger.error(f"Fast signal error {asset}/{timeframe}: {e}")
        return {"signal": None, "message": "Analysis error", "fast_mode": True}

    return {"signal": None, "message": f"No strong signal found for {asset} on {timeframe.value}", "fast_mode": True}


@router.get("/scan/{category}/{timeframe}")
async def scan_category(category: AssetCategory, timeframe: Timeframe, min_confidence: float = 80):
    """Scan all assets in a category for signals."""
    if not is_market_open(category):
        return {"category": category, "timeframe": timeframe, "signals_found": 0, "signals": [], "message": "Market closed"}
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
