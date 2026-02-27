"""
Signal Generation Scheduler
Periodically scans markets and generates signals.
Includes per-asset cooldown to prevent duplicate/contradictory signals.
"""
from datetime import datetime, timedelta
from typing import Dict

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from loguru import logger

from app.analysis.data_provider import data_provider
from app.analysis.technical import analyzer
from app.config import settings
from app.models import AssetCategory, Timeframe

scheduler = AsyncIOScheduler()

# ── Per-asset cooldown tracking ──
# Maps "ASSET" -> datetime of last published signal
_signal_cooldowns: Dict[str, datetime] = {}
COOLDOWN_SECONDS = 120  # 2 minutes between signals for the same asset

# Which timeframes to scan on each interval
SCAN_CONFIG = [
    (AssetCategory.FOREX_OTC, [
        "EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC", "USDCHF_OTC", "AUDUSD_OTC",
        "EURGBP_OTC", "EURJPY_OTC", "GBPJPY_OTC",
    ], [Timeframe.M1, Timeframe.M2, Timeframe.M5, Timeframe.M15, Timeframe.H1]),
    (AssetCategory.FOREX, [
        "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
        "EURGBP", "EURJPY", "GBPJPY", "EURAUD", "EURCAD", "GBPAUD", "GBPCAD",
        "AUDCAD", "AUDJPY", "CADJPY", "CHFJPY", "NZDJPY",
    ], [Timeframe.M1, Timeframe.M2, Timeframe.M5, Timeframe.M15, Timeframe.H1, Timeframe.H4]),
    (AssetCategory.CRYPTO, [
        "BTCUSD", "ETHUSD", "SOLUSD", "BNBUSD", "XRPUSD", "ADAUSD",
        "DOTUSD", "DOGEUSD", "AVAXUSD", "LINKUSD", "LTCUSD",
    ], [Timeframe.M1, Timeframe.M2, Timeframe.M5, Timeframe.M15, Timeframe.H1, Timeframe.H4]),
    (AssetCategory.COMMODITIES, [
        "XAUUSD", "XAGUSD", "USOIL", "UKOIL", "NATGAS", "COPPER",
        "XPTUSD", "XPDUSD", "WHEAT", "CORN", "COFFEE",
    ], [Timeframe.M1, Timeframe.M2, Timeframe.M5, Timeframe.M15, Timeframe.H1, Timeframe.H4]),
    (AssetCategory.INDICES, [
        "US500", "US30", "USTEC", "DE40", "UK100", "JP225",
        "FR40", "EU50", "AU200", "HK50", "VIX", "US2000",
    ], [Timeframe.M1, Timeframe.M2, Timeframe.M5, Timeframe.M15, Timeframe.H1, Timeframe.D1]),
]


async def scan_markets():
    """Main scanning job - runs every N seconds.
    Collects all timeframe signals per asset, picks the best one,
    and enforces a per-asset cooldown to avoid spam.
    """
    logger.info("🔍 Market scan started")
    signals_found = 0
    now = datetime.utcnow()

    for category, assets, timeframes in SCAN_CONFIG:
        for asset in assets:
            # ── Check cooldown ──
            last_signal_time = _signal_cooldowns.get(asset)
            if last_signal_time and (now - last_signal_time).total_seconds() < COOLDOWN_SECONDS:
                continue  # Skip — recently signaled

            # ── Collect signals from all timeframes for this asset ──
            best_result = None

            for tf in timeframes:
                try:
                    df = await data_provider.fetch_ohlcv(asset, tf.value, limit=100)
                    if df is None or df.empty:
                        continue

                    result = analyzer.analyze(df, asset, category, tf)
                    if result and result.confidence >= settings.signal_min_confidence:
                        # Keep only the highest-confidence signal for this asset
                        if best_result is None or result.confidence > best_result.confidence:
                            best_result = result
                except Exception as e:
                    logger.error(f"Error scanning {asset}/{tf}: {e}")

            # ── Publish only the best signal (if any) ──
            if best_result:
                await _publish_signal(best_result)
                _signal_cooldowns[asset] = now
                signals_found += 1
                logger.info(
                    f"✅ Signal: {best_result.action} {asset} @ {best_result.entry_price} "
                    f"(conf: {best_result.confidence}%, tf: {best_result.timeframe.value})"
                )

    logger.info(f"🔍 Scan complete: {signals_found} signals generated")


async def _publish_signal(result):
    """Send generated signal to the Node.js backend API."""
    expires = datetime.utcnow() + timedelta(hours=4)

    payload = {
        "asset": result.asset,
        "category": result.category.value,
        "action": result.action.value,
        "timeframe": result.timeframe.value,
        "entryPrice": result.entry_price,
        "takeProfit1": result.tp1,
        "takeProfit2": result.tp2,
        "takeProfit3": result.tp3,
        "stopLoss": result.sl,
        "confidenceScore": result.confidence,
        "riskLevel": result.risk_level.value,
        "analysis": result.reasoning,
        "expiresAt": expires.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.api_url}/signals/internal",
                json=payload,
                headers={
                    "X-Engine-Key": settings.api_key,
                    "Content-Type": "application/json",
                },
                timeout=10,
            )
            if response.status_code not in (200, 201):
                logger.warning(f"Failed to publish signal: {response.status_code} {response.text}")
    except Exception as e:
        logger.error(f"Error publishing signal to backend: {e}")


async def start_scheduler():
    """Start the periodic market scanner."""
    scheduler.add_job(
        scan_markets,
        "interval",
        seconds=settings.analysis_interval_seconds,
        id="market_scanner",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(f"⏰ Scheduler started (interval: {settings.analysis_interval_seconds}s)")


async def stop_scheduler():
    """Stop the scheduler."""
    scheduler.shutdown(wait=False)
    await data_provider.close()
