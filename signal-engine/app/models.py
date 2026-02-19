"""Pydantic models for API requests/responses."""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class AssetCategory(str, Enum):
    FOREX_OTC = "FOREX_OTC"
    FOREX = "FOREX"
    CRYPTO = "CRYPTO"
    INDICES = "INDICES"
    COMMODITIES = "COMMODITIES"


class SignalAction(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class Timeframe(str, Enum):
    M1 = "M1"
    M2 = "M2"
    M3 = "M3"
    M4 = "M4"
    M5 = "M5"
    M15 = "M15"
    M30 = "M30"
    H1 = "H1"
    H4 = "H4"
    D1 = "D1"
    W1 = "W1"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class IndicatorResult(BaseModel):
    """Result from a single technical indicator."""
    name: str
    value: float
    signal: SignalAction
    strength: float = Field(ge=0, le=100)


class AnalysisResult(BaseModel):
    """Complete technical analysis result for an asset."""
    asset: str
    category: AssetCategory
    timeframe: Timeframe
    action: SignalAction
    confidence: float = Field(ge=0, le=100)
    risk_level: RiskLevel
    entry_price: float
    tp1: float
    tp2: Optional[float] = None
    tp3: Optional[float] = None
    sl: float
    indicators: list[IndicatorResult]
    reasoning: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SignalCreate(BaseModel):
    """Signal creation payload sent to the backend API."""
    asset: str
    category: AssetCategory
    action: SignalAction
    timeframe: Timeframe
    entryPrice: float
    tp1: float
    tp2: Optional[float] = None
    tp3: Optional[float] = None
    sl: float
    confidence: float
    riskLevel: RiskLevel
    analysis: str
    expiresAt: str  # ISO datetime


class BacktestRequest(BaseModel):
    """Backtesting request parameters."""
    asset: str
    category: AssetCategory
    timeframe: Timeframe
    start_date: str
    end_date: str
    initial_balance: float = 10000.0
    risk_per_trade: float = 2.0


class BacktestResult(BaseModel):
    """Backtesting result summary."""
    asset: str
    total_trades: int
    wins: int
    losses: int
    win_rate: float
    total_pips: float
    profit_factor: float
    max_drawdown: float
    sharpe_ratio: float
    final_balance: float
    trades: list[dict]
