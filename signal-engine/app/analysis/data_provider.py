"""
Market Data Provider — FREE Unlimited Data (No API Key Required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sources:
  • Crypto      → CCXT (Binance public API) — no key needed
  • Forex       → yfinance (Yahoo Finance)  — no key needed
  • Forex OTC   → yfinance (mirrors spot forex)
  • Indices     → yfinance
  • Commodities → yfinance

Zero API keys. Zero rate limits. Zero cost. Unlimited data.
Caching: Redis with timeframe-based TTL for speed.
"""
import asyncio
import json
from datetime import datetime, timedelta
from typing import Optional

import ccxt.async_support as ccxt
import pandas as pd
import yfinance as yf
from loguru import logger

from app.config import settings


class DataProvider:
    """Fetches real market data from free sources — no API keys required."""

    TIMEFRAME_MAP = {
        "M1": "1m", "M2": "2m", "M3": "5m", "M4": "5m",
        "M5": "5m", "M15": "15m", "M30": "30m",
        "H1": "1h", "H4": "1h", "D1": "1d", "W1": "1wk",
    }

    # yfinance interval strings
    YF_INTERVAL = {
        "M1": "1m", "M2": "2m", "M3": "5m", "M4": "5m",
        "M5": "5m", "M15": "15m", "M30": "30m",
        "H1": "1h", "H4": "1h", "D1": "1d", "W1": "1wk",
    }

    # yfinance period (how far back) — 1m max 7d, 2m-30m max 60d, 1h max 730d
    YF_PERIOD = {
        "M1": "5d", "M2": "5d", "M3": "5d", "M4": "5d",
        "M5": "5d", "M15": "60d", "M30": "60d",
        "H1": "30d", "H4": "60d", "D1": "1y", "W1": "2y",
    }

    # Cache TTL in seconds per timeframe
    CACHE_TTL = {
        "M1": 25, "M2": 25, "M3": 30, "M4": 30,
        "M5": 45, "M15": 90, "M30": 150,
        "H1": 300, "H4": 600, "D1": 1800, "W1": 3600,
    }

    # ── Symbol Mappings ─────────────────────────────────────

    # Crypto → CCXT (Binance public, no key)
    CRYPTO_SYMBOLS = {
        "BTCUSD": "BTC/USDT", "ETHUSD": "ETH/USDT", "BNBUSD": "BNB/USDT",
        "SOLUSD": "SOL/USDT", "XRPUSD": "XRP/USDT", "ADAUSD": "ADA/USDT",
        "DOTUSD": "DOT/USDT", "DOGEUSD": "DOGE/USDT", "AVAXUSD": "AVAX/USDT",
        "LINKUSD": "LINK/USDT", "MATICUSD": "MATIC/USDT", "UNIUSD": "UNI/USDT",
        "ATOMUSD": "ATOM/USDT", "LTCUSD": "LTC/USDT", "NEARUSD": "NEAR/USDT",
        "APTUSD": "APT/USDT", "ARBUSD": "ARB/USDT", "OPUSD": "OP/USDT",
        "FILUSD": "FIL/USDT", "TRXUSD": "TRX/USDT", "SHIBUSD": "SHIB/USDT",
        "XLMUSD": "XLM/USDT", "ALGOUSD": "ALGO/USDT",
    }

    # Forex → yfinance (EURUSD=X format)
    FOREX_SYMBOLS = {
        "EURUSD": "EURUSD=X", "GBPUSD": "GBPUSD=X", "USDJPY": "USDJPY=X",
        "USDCHF": "USDCHF=X", "AUDUSD": "AUDUSD=X", "USDCAD": "USDCAD=X",
        "NZDUSD": "NZDUSD=X", "EURGBP": "EURGBP=X", "EURJPY": "EURJPY=X",
        "GBPJPY": "GBPJPY=X", "EURAUD": "EURAUD=X", "EURCAD": "EURCAD=X",
        "EURCHF": "EURCHF=X", "EURNZD": "EURNZD=X", "GBPAUD": "GBPAUD=X",
        "GBPCAD": "GBPCAD=X", "GBPCHF": "GBPCHF=X", "GBPNZD": "GBPNZD=X",
        "AUDCAD": "AUDCAD=X", "AUDCHF": "AUDCHF=X", "AUDJPY": "AUDJPY=X",
        "AUDNZD": "AUDNZD=X", "CADJPY": "CADJPY=X", "CADCHF": "CADCHF=X",
        "CHFJPY": "CHFJPY=X", "NZDJPY": "NZDJPY=X", "NZDCAD": "NZDCAD=X",
        "NZDCHF": "NZDCHF=X",
    }

    # OTC → same underlying forex data (OTC mirrors spot)
    FOREX_OTC_SYMBOLS = {
        f"{pair}_OTC": yf_sym
        for pair, yf_sym in FOREX_SYMBOLS.items()
    }

    # Commodities → yfinance futures symbols
    COMMODITY_SYMBOLS = {
        "XAUUSD": "GC=F",       # Gold
        "XAGUSD": "SI=F",       # Silver
        "USOIL": "CL=F",        # WTI Crude
        "UKOIL": "BZ=F",        # Brent Crude
        "NATGAS": "NG=F",       # Natural Gas
        "COPPER": "HG=F",       # Copper
        "XPTUSD": "PL=F",       # Platinum
        "XPDUSD": "PA=F",       # Palladium
        "WHEAT": "ZW=F",        # Wheat
        "CORN": "ZC=F",         # Corn
        "SOYBEAN": "ZS=F",      # Soybeans
        "COFFEE": "KC=F",       # Coffee
        "SUGAR": "SB=F",        # Sugar
        "COTTON": "CT=F",       # Cotton
        "COCOA": "CC=F",        # Cocoa
        "LUMBER": "LBS=F",      # Lumber
    }

    # Indices → yfinance index symbols
    INDEX_SYMBOLS = {
        "US500": "^GSPC",        # S&P 500
        "US30": "^DJI",          # Dow Jones
        "USTEC": "^IXIC",        # Nasdaq
        "DE40": "^GDAXI",        # DAX
        "UK100": "^FTSE",        # FTSE 100
        "JP225": "^N225",        # Nikkei
        "FR40": "^FCHI",         # CAC 40
        "EU50": "^STOXX50E",     # Euro Stoxx 50
        "AU200": "^AXJO",        # ASX 200
        "HK50": "^HSI",          # Hang Seng
        "CN50": "000001.SS",     # Shanghai
        "ES35": "^IBEX",         # IBEX 35
        "IT40": "FTSEMIB.MI",    # FTSE MIB
        "NL25": "^AEX",          # AEX
        "CH20": "^SSMI",         # SMI
        "VIX": "^VIX",           # VIX
        "US2000": "^RUT",        # Russell 2000
        "SG30": "^STI",          # Straits Times
    }

    def __init__(self):
        self._exchange: ccxt.Exchange | None = None
        self._redis = None
        self._redis_failed = False

    async def _get_exchange(self) -> ccxt.Exchange:
        """Get CCXT exchange (Binance public, no API key needed)."""
        if self._exchange is None:
            exchange_class = getattr(ccxt, settings.ccxt_exchange, ccxt.binance)
            self._exchange = exchange_class({"enableRateLimit": True})
        return self._exchange

    async def _get_redis(self):
        """Get Redis connection for caching."""
        if self._redis_failed:
            return None
        if self._redis is None:
            try:
                import redis.asyncio as aioredis
                self._redis = aioredis.from_url(
                    settings.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=1,
                    socket_timeout=1,
                )
                await self._redis.ping()
                logger.info("📦 Data cache: Redis connected")
            except Exception as e:
                logger.warning(f"📦 Data cache: Redis unavailable ({e}), running without cache")
                self._redis = None
                self._redis_failed = True
        return self._redis

    # ── Cache Layer ──────────────────────────────────────────

    async def _cache_get(self, key: str) -> pd.DataFrame | None:
        """Get cached OHLCV data from Redis."""
        try:
            r = await self._get_redis()
            if r is None:
                return None
            raw = await r.get(f"ohlcv:{key}")
            if raw:
                data = json.loads(raw)
                df = pd.DataFrame(data)
                df.index = pd.to_datetime(df.index)
                logger.debug(f"📦 Cache HIT: {key}")
                return df
        except Exception as e:
            logger.debug(f"Cache read error: {e}")
        return None

    async def _cache_set(self, key: str, df: pd.DataFrame, ttl: int):
        """Store OHLCV data in Redis with TTL."""
        try:
            r = await self._get_redis()
            if r is None:
                return
            data = df.copy()
            data.index = data.index.astype(str)
            await r.setex(f"ohlcv:{key}", ttl, data.to_json())
            logger.debug(f"📦 Cache SET: {key} (TTL={ttl}s)")
        except Exception as e:
            logger.debug(f"Cache write error: {e}")

    # ── Main Fetch Method ────────────────────────────────────

    async def fetch_ohlcv(self, asset: str, timeframe: str, limit: int = 100) -> pd.DataFrame | None:
        """
        Fetch real OHLCV data for any asset category.
        No API key needed — everything is free and unlimited.
        """
        cache_key = f"{asset}:{timeframe}:{limit}"
        ttl = self.CACHE_TTL.get(timeframe, 120)

        # ── Check cache first ──
        cached = await self._cache_get(cache_key)
        if cached is not None and len(cached) >= limit * 0.8:
            return cached

        # ── Route to the correct provider ──
        df = None

        if asset in self.CRYPTO_SYMBOLS:
            tf = self.TIMEFRAME_MAP.get(timeframe, "1h")
            df = await self._fetch_ccxt(self.CRYPTO_SYMBOLS[asset], tf, limit)

        elif asset in self.FOREX_OTC_SYMBOLS:
            yf_symbol = self.FOREX_OTC_SYMBOLS[asset]
            df = await self._fetch_yfinance(yf_symbol, timeframe, limit)

        elif asset in self.FOREX_SYMBOLS:
            yf_symbol = self.FOREX_SYMBOLS[asset]
            df = await self._fetch_yfinance(yf_symbol, timeframe, limit)

        elif asset in self.COMMODITY_SYMBOLS:
            yf_symbol = self.COMMODITY_SYMBOLS[asset]
            df = await self._fetch_yfinance(yf_symbol, timeframe, limit)

        elif asset in self.INDEX_SYMBOLS:
            yf_symbol = self.INDEX_SYMBOLS[asset]
            df = await self._fetch_yfinance(yf_symbol, timeframe, limit)

        else:
            logger.warning(f"Unknown asset: {asset}")
            return None

        # ── Cache successful fetches ──
        if df is not None and not df.empty:
            await self._cache_set(cache_key, df, ttl)

        return df

    # ── CCXT Provider (Crypto) — No API Key ──────────────────

    async def _fetch_ccxt(self, symbol: str, timeframe: str, limit: int) -> pd.DataFrame | None:
        """Fetch crypto OHLCV from Binance via CCXT (public, no key)."""
        try:
            exchange = await self._get_exchange()
            ohlcv = await exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            if not ohlcv:
                return None

            df = pd.DataFrame(ohlcv, columns=["timestamp", "open", "high", "low", "close", "volume"])
            df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
            df.set_index("timestamp", inplace=True)
            logger.info(f"✅ CCXT: {symbol} ({len(df)} candles)")
            return df
        except Exception as e:
            logger.error(f"❌ CCXT error for {symbol}: {e}")
            return None

    # ── yfinance Provider (Forex, Indices, Commodities) — No API Key ──

    async def _fetch_yfinance(self, symbol: str, timeframe: str, limit: int) -> pd.DataFrame | None:
        """
        Fetch OHLCV from Yahoo Finance via yfinance.
        ✅ FREE — no API key, no rate limits, no credit system.
        Supports: Forex (EURUSD=X), Indices (^GSPC), Commodities (GC=F)
        """
        interval = self.YF_INTERVAL.get(timeframe, "1h")
        period = self.YF_PERIOD.get(timeframe, "30d")

        try:
            # yfinance is synchronous — run in thread pool to not block async loop
            df = await asyncio.to_thread(self._yf_download, symbol, interval, period)

            if df is None or df.empty:
                logger.warning(f"⚠️ yfinance: No data for {symbol} ({interval})")
                return None

            # Normalize column names to lowercase
            df.columns = [c.lower() for c in df.columns]

            # Ensure we have required columns
            required = ["open", "high", "low", "close"]
            if not all(c in df.columns for c in required):
                logger.error(f"❌ yfinance: Missing columns for {symbol}: {df.columns.tolist()}")
                return None

            # Add volume if missing (forex often has 0 volume)
            if "volume" not in df.columns:
                df["volume"] = 0
            df["volume"] = pd.to_numeric(df["volume"], errors="coerce").fillna(0)

            # Convert price columns to float
            for col in required:
                df[col] = pd.to_numeric(df[col], errors="coerce")

            # Drop NaN rows
            df = df.dropna(subset=required)

            # Trim to requested limit
            if len(df) > limit:
                df = df.tail(limit)

            logger.info(f"✅ yfinance: {symbol} ({len(df)} candles, {interval})")
            return df

        except Exception as e:
            logger.error(f"❌ yfinance error for {symbol}: {e}")
            return None

    def _yf_download(self, symbol: str, interval: str, period: str) -> pd.DataFrame | None:
        """Synchronous yfinance download (called via asyncio.to_thread)."""
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period, interval=interval)

            if df is None or df.empty:
                # Fallback: try yf.download for edge cases
                df = yf.download(symbol, period=period, interval=interval, progress=False)

            return df
        except Exception as e:
            logger.error(f"yfinance download error: {e}")
            return None

    # ── Cleanup ──────────────────────────────────────────────

    async def close(self):
        """Gracefully close all connections."""
        if self._exchange:
            await self._exchange.close()
        if self._redis:
            await self._redis.close()


# Singleton
data_provider = DataProvider()
