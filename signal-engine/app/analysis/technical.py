"""
Core Technical Analysis Engine — Fast 3-Indicator System
Optimized for rapid signal generation (< 30 seconds).
Indicators: RSI(14), MACD(12,26,9), EMA Cross(9/21)
"""
import numpy as np
import pandas as pd
import ta
from loguru import logger

from app.models import (
    AnalysisResult, AssetCategory, IndicatorResult,
    RiskLevel, SignalAction, Timeframe,
)


class TechnicalAnalyzer:
    """Fast 3-indicator technical analysis engine."""

    # Minimum candles needed (reduced for speed)
    MIN_CANDLES = 30

    def analyze(self, df: pd.DataFrame, asset: str, category: AssetCategory, timeframe: Timeframe) -> AnalysisResult | None:
        """
        Run fast technical analysis on OHLCV data.
        Uses only RSI + MACD + EMA for rapid signal generation.
        """
        if len(df) < self.MIN_CANDLES:
            logger.warning(f"Insufficient data for {asset} ({len(df)} candles, need {self.MIN_CANDLES})")
            return None

        indicators = self._compute_indicators(df, category)
        if not indicators:
            return None

        # Aggregate signals
        buy_score = sum(ind.strength for ind in indicators if ind.signal == SignalAction.BUY)
        sell_score = sum(ind.strength for ind in indicators if ind.signal == SignalAction.SELL)
        total_weight = sum(ind.strength for ind in indicators)

        if total_weight == 0:
            return None

        # Need ALL indicators agreeing for a valid signal (strict consensus)
        buy_count = sum(1 for ind in indicators if ind.signal == SignalAction.BUY)
        sell_count = sum(1 for ind in indicators if ind.signal == SignalAction.SELL)
        n = len(indicators)

        # OTC: 2 indicators agreeing is enough (Stochastic always present)
        # Non-OTC: all 3 must agree (strict quality for live signals)
        if n == 0:
            return None
        if n >= 3:
            required = 2 if category == AssetCategory.FOREX_OTC else 3
            if max(buy_count, sell_count) < required:
                return None
        if n == 2 and max(buy_count, sell_count) < 2:
            return None  # Both indicators must agree
        if n == 1:
            return None  # Single indicator not reliable enough

        action = SignalAction.BUY if buy_score > sell_score else SignalAction.SELL
        raw_confidence = (max(buy_score, sell_score) / total_weight) * 100

        # ── Price Action Filter (OTC only) ──────────────────────────────
        # Validates signal against actual recent candles to avoid lag-induced errors
        # yfinance data can be 15-30s delayed on M1; recent candles reveal true direction
        if category == AssetCategory.FOREX_OTC:
            pa_result = self._price_action_filter(df, action)
            if pa_result == "reject":
                logger.debug(f"Price action filter rejected {action.value} signal — recent candles contradict")
                return None
            elif pa_result == "weak":
                raw_confidence = max(0, raw_confidence - 12)

        # Boost confidence based on agreement level
        agreeing = buy_count if action == SignalAction.BUY else sell_count
        if agreeing == 3 and n == 3:
            # All 3 unanimous — very strong signal
            raw_confidence = min(97, max(raw_confidence + 10, 78))
        elif agreeing == 2 and n == 3:
            # Majority 2/3 — good signal (OTC only)
            raw_confidence = min(88, max(raw_confidence + 5, 72))
        elif agreeing == 2 and n == 2:
            # Both agree — solid signal
            raw_confidence = min(90, max(raw_confidence + 5, 70))
        else:
            # Partial agreement — reduce confidence
            raw_confidence = min(75, raw_confidence)

        confidence = round(min(97, raw_confidence), 1)

        # Calculate price levels
        current = float(df["close"].iloc[-1])
        atr = float(ta.volatility.AverageTrueRange(
            df["high"], df["low"], df["close"], window=14
        ).average_true_range().iloc[-1])

        entry_price, tp1, tp2, tp3, sl = self._calculate_levels(action, current, atr, category)
        risk_level = self._assess_risk(atr, current, confidence)
        reasoning = self._generate_reasoning(indicators, action, confidence)

        return AnalysisResult(
            asset=asset,
            category=category,
            timeframe=timeframe,
            action=action,
            confidence=confidence,
            risk_level=risk_level,
            entry_price=entry_price,
            tp1=tp1,
            tp2=tp2,
            tp3=tp3,
            sl=sl,
            indicators=indicators,
            reasoning=reasoning,
        )

    def _compute_indicators(self, df: pd.DataFrame, category: AssetCategory) -> list[IndicatorResult]:
        """Compute RSI + EMA (all categories) + MACD (non-OTC only)."""
        results: list[IndicatorResult] = []
        close = df["close"]
        use_macd = category != AssetCategory.FOREX_OTC

        # ── 1) RSI (14) ─────────────────────────────────────
        rsi_series = ta.momentum.RSIIndicator(close, window=14).rsi()
        rsi = rsi_series.iloc[-1]
        rsi_prev = rsi_series.iloc[-2]

        if rsi < 30:
            results.append(IndicatorResult(name="RSI(14)", value=round(rsi, 2), signal=SignalAction.BUY, strength=90))
        elif rsi > 70:
            results.append(IndicatorResult(name="RSI(14)", value=round(rsi, 2), signal=SignalAction.SELL, strength=90))
        elif rsi < 40:
            # RSI rising from below = bullish momentum
            s = 65 if rsi > rsi_prev else 50
            results.append(IndicatorResult(name="RSI(14)", value=round(rsi, 2), signal=SignalAction.BUY, strength=s))
        elif rsi > 60:
            # RSI falling from above = bearish momentum
            s = 65 if rsi < rsi_prev else 50
            results.append(IndicatorResult(name="RSI(14)", value=round(rsi, 2), signal=SignalAction.SELL, strength=s))
        # Neutral zone (40-60): RSI gives NO signal — too ambiguous for reliable trading
        # This prevents false signals in choppy/ranging markets

        # ── 2) MACD (12, 26, 9) ─────────────────────────────
        # Skipped for FOREX_OTC: MACD needs 26+ candles and slows down M1 signals
        if use_macd:
            macd_obj = ta.trend.MACD(close, window_slow=26, window_fast=12, window_sign=9)
            macd_hist = macd_obj.macd_diff().iloc[-1]
            macd_prev = macd_obj.macd_diff().iloc[-2]
            macd_prev2 = macd_obj.macd_diff().iloc[-3] if len(df) > 30 else macd_prev

            if macd_hist > 0 and macd_prev <= 0:
                results.append(IndicatorResult(name="MACD", value=round(macd_hist, 6), signal=SignalAction.BUY, strength=85))
            elif macd_hist < 0 and macd_prev >= 0:
                results.append(IndicatorResult(name="MACD", value=round(macd_hist, 6), signal=SignalAction.SELL, strength=85))
            elif macd_hist > 0 and macd_hist > macd_prev:
                results.append(IndicatorResult(name="MACD", value=round(macd_hist, 6), signal=SignalAction.BUY, strength=55))
            elif macd_hist < 0 and macd_hist < macd_prev:
                results.append(IndicatorResult(name="MACD", value=round(macd_hist, 6), signal=SignalAction.SELL, strength=55))
            elif macd_hist > 0:
                results.append(IndicatorResult(name="MACD", value=round(macd_hist, 6), signal=SignalAction.BUY, strength=35))
            else:
                results.append(IndicatorResult(name="MACD", value=round(macd_hist, 6), signal=SignalAction.SELL, strength=35))

        # ── 3) EMA Cross (9/21) ─────────────────────────────
        ema9 = ta.trend.EMAIndicator(close, window=9).ema_indicator()
        ema21 = ta.trend.EMAIndicator(close, window=21).ema_indicator()
        ema9_now = ema9.iloc[-1]
        ema21_now = ema21.iloc[-1]
        ema9_prev = ema9.iloc[-2]
        ema21_prev = ema21.iloc[-2]
        ema_diff = ema9_now - ema21_now
        ema_diff_prev = ema9_prev - ema21_prev

        if ema9_now > ema21_now and ema9_prev <= ema21_prev:
            # Fresh golden cross
            results.append(IndicatorResult(name="EMA(9/21)", value=round(ema_diff, 6), signal=SignalAction.BUY, strength=90))
        elif ema9_now < ema21_now and ema9_prev >= ema21_prev:
            # Fresh death cross
            results.append(IndicatorResult(name="EMA(9/21)", value=round(ema_diff, 6), signal=SignalAction.SELL, strength=90))
        elif ema9_now > ema21_now:
            # EMA gap widening = stronger trend
            s = 60 if abs(ema_diff) > abs(ema_diff_prev) else 45
            results.append(IndicatorResult(name="EMA(9/21)", value=round(ema_diff, 6), signal=SignalAction.BUY, strength=s))
        else:
            s = 60 if abs(ema_diff) > abs(ema_diff_prev) else 45
            results.append(IndicatorResult(name="EMA(9/21)", value=round(ema_diff, 6), signal=SignalAction.SELL, strength=s))

        # ── 4) Stochastic (5,3,3) — FOREX_OTC only ──────────
        # Fast oscillator ideal for M1: always votes, avoids RSI neutral-zone gaps
        if not use_macd:  # i.e., FOREX_OTC
            stoch = ta.momentum.StochasticOscillator(
                df["high"], df["low"], close, window=5, smooth_window=3
            )
            k = stoch.stoch().iloc[-1]
            k_prev = stoch.stoch().iloc[-2]
            d = stoch.stoch_signal().iloc[-1]

            if k < 20:
                # Oversold — strong buy
                results.append(IndicatorResult(name="Stoch(5,3)", value=round(k, 2), signal=SignalAction.BUY, strength=85))
            elif k > 80:
                # Overbought — strong sell
                results.append(IndicatorResult(name="Stoch(5,3)", value=round(k, 2), signal=SignalAction.SELL, strength=85))
            elif k > d and k_prev <= d:
                # K crosses above D — bullish crossover
                results.append(IndicatorResult(name="Stoch(5,3)", value=round(k, 2), signal=SignalAction.BUY, strength=70))
            elif k < d and k_prev >= d:
                # K crosses below D — bearish crossover
                results.append(IndicatorResult(name="Stoch(5,3)", value=round(k, 2), signal=SignalAction.SELL, strength=70))
            elif k > d:
                # K above D — upward bias
                results.append(IndicatorResult(name="Stoch(5,3)", value=round(k, 2), signal=SignalAction.BUY, strength=45))
            else:
                # K below D — downward bias
                results.append(IndicatorResult(name="Stoch(5,3)", value=round(k, 2), signal=SignalAction.SELL, strength=45))

        return results

    def _price_action_filter(self, df: pd.DataFrame, action: SignalAction) -> str:
        """
        Validate signal against recent candle price action.
        Returns: 'ok', 'weak', or 'reject'

        Logic:
        - Look at last 5 candles body direction + recent momentum
        - If 4+ candles strongly oppose the signal → reject
        - If 3 candles oppose AND momentum is against → weak (reduce confidence)
        - Otherwise → ok
        """
        last = df.tail(5)
        bodies = last["close"] - last["open"]  # positive = bullish, negative = bearish

        bullish_count = int((bodies > 0).sum())
        bearish_count = int((bodies < 0).sum())

        # Recent momentum: is price going up or down over last 5 candles?
        momentum = float(df["close"].iloc[-1]) - float(df["close"].iloc[-6]) if len(df) > 6 else 0.0
        momentum_bullish = momentum > 0

        if action == SignalAction.BUY:
            # BUY signal: check if recent candles are actually bearish
            if bearish_count >= 4:
                return "reject"  # 4+ of last 5 candles bearish — clearly wrong direction
            if bearish_count >= 3 and not momentum_bullish:
                return "weak"   # 3 bearish + downward momentum = weaker signal
        else:  # SELL
            # SELL signal: check if recent candles are actually bullish
            if bullish_count >= 4:
                return "reject"  # 4+ of last 5 candles bullish — clearly wrong direction
            if bullish_count >= 3 and momentum_bullish:
                return "weak"   # 3 bullish + upward momentum = weaker signal

        return "ok"

    def _calculate_levels(
        self, action: SignalAction, price: float, atr: float, category: AssetCategory
    ) -> tuple[float, float, float, float, float]:
        """Calculate entry, TP1-3 and SL based on ATR."""
        # Precision: more decimals for forex, fewer for crypto/indices
        precision = {
            AssetCategory.FOREX_OTC: 5,
            AssetCategory.FOREX: 5,
            AssetCategory.CRYPTO: 2,
            AssetCategory.INDICES: 1,
            AssetCategory.COMMODITIES: 2,
        }.get(category, 5)

        multipliers = {
            AssetCategory.FOREX_OTC: (1.2, 2.0, 3.0, 1.0),
            AssetCategory.FOREX: (1.5, 2.5, 3.5, 1.0),
            AssetCategory.CRYPTO: (2.0, 3.5, 5.0, 1.5),
            AssetCategory.INDICES: (1.5, 2.5, 4.0, 1.2),
            AssetCategory.COMMODITIES: (1.5, 2.5, 3.5, 1.0),
        }
        tp1_m, tp2_m, tp3_m, sl_m = multipliers.get(category, (1.5, 2.5, 3.5, 1.0))

        if action == SignalAction.BUY:
            return (
                round(price, precision),
                round(price + atr * tp1_m, precision),
                round(price + atr * tp2_m, precision),
                round(price + atr * tp3_m, precision),
                round(price - atr * sl_m, precision),
            )
        else:
            return (
                round(price, precision),
                round(price - atr * tp1_m, precision),
                round(price - atr * tp2_m, precision),
                round(price - atr * tp3_m, precision),
                round(price + atr * sl_m, precision),
            )

    def _assess_risk(self, atr: float, price: float, confidence: float) -> RiskLevel:
        """Assess risk level based on ATR percentage and confidence."""
        atr_pct = (atr / price) * 100
        if atr_pct < 0.5 and confidence > 85:
            return RiskLevel.LOW
        elif atr_pct > 2.0 or confidence < 75:
            return RiskLevel.HIGH
        return RiskLevel.MEDIUM

    def _generate_reasoning(self, indicators: list[IndicatorResult], action: SignalAction, confidence: float) -> str:
        """Generate human-readable analysis reasoning."""
        supporting = [i for i in indicators if i.signal == action]
        opposing = [i for i in indicators if i.signal != action]

        lines = [f"Signal {action.value} (confiance: {confidence}%)"]
        if supporting:
            lines.append(f"✅ {', '.join(f'{i.name}={i.value}' for i in supporting)}")
        if opposing:
            lines.append(f"⚠️ {', '.join(f'{i.name}={i.value}' for i in opposing)}")

        # Add directional context
        rsi_ind = next((i for i in indicators if "RSI" in i.name), None)
        if rsi_ind:
            if rsi_ind.value < 30:
                lines.append("Zone de survente forte")
            elif rsi_ind.value > 70:
                lines.append("Zone de surachat forte")

        return " | ".join(lines)


# Singleton
analyzer = TechnicalAnalyzer()
