"""Application configuration via environment variables."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
    redis_url: str = "redis://localhost:6379"
    api_url: str = "http://localhost:3001/api"
    api_key: str = "dev_key"

    # ── Data Providers (all free, no API keys needed) ──
    ccxt_exchange: str = "binance"   # Crypto via CCXT (public API)
    # Forex/Indices/Commodities via yfinance (Yahoo Finance) — zero config

    # ── Signal Configuration ──
    signal_min_confidence: int = 55
    max_concurrent_signals: int = 10
    analysis_interval_seconds: int = 30
    backtest_lookback_days: int = 90

    # ── OTC Settings ──
    otc_signal_timeout: int = 30    # Max seconds to find a signal for OTC
    otc_min_confidence: int = 50    # Lower threshold for fast OTC signals

    log_level: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
