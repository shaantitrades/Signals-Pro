"""
Core Technical Analysis Engine - Multi-EMA Vote System (Always-On)
Strategie pour Pocket Option : CHAQUE check retourne BUY ou SELL.
4 votes EMA (Prix/EMA5, EMA5/EMA7, EMA7/EMA10, EMA5/EMA10) -> score -4 a +4.
Confiance : 92%(4/4) | 85%(3/4) | 78%(2/4) | 72%(1/4) | 70%(tie)
"""
import pandas as pd
import ta
from loguru import logger

from app.models import (
    AnalysisResult, AssetCategory, IndicatorResult,
    RiskLevel, SignalAction, Timeframe,
)


class TechnicalAnalyzer:
    """Multi-EMA always-on signal engine - optimise Pocket Option."""

    MIN_CANDLES = 15

    def analyze(self, df: pd.DataFrame, asset: str, category: AssetCategory, timeframe: Timeframe) -> AnalysisResult | None:
        """Retourne TOUJOURS un signal BUY ou SELL. Confiance 70-92%."""
        if len(df) < self.MIN_CANDLES:
            logger.warning(f"Insufficient data for {asset} ({len(df)} candles, need {self.MIN_CANDLES})")
            return None

        indicators, action, confidence = self._compute_indicators(df, category)

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

    def _compute_indicators(
        self, df: pd.DataFrame, category: AssetCategory
    ) -> tuple[list[IndicatorResult], SignalAction, float]:
        """
        4 votes EMA -> toujours BUY ou SELL.
          V1: prix > EMA5   V2: EMA5 > EMA7   V3: EMA7 > EMA10   V4: EMA5 > EMA10
        Score +4 a -4 -> direction + confiance.
        """
        if len(df) > 20:
            df = df.tail(20).reset_index(drop=True)

        close = df["close"]
        price_now = float(close.iloc[-1])

        ema5  = float(ta.trend.EMAIndicator(close, window=5).ema_indicator().iloc[-1])
        ema7  = float(ta.trend.EMAIndicator(close, window=7).ema_indicator().iloc[-1])
        ema10 = float(ta.trend.EMAIndicator(close, window=10).ema_indicator().iloc[-1])

        v1 = 1 if price_now > ema5  else -1
        v2 = 1 if ema5      > ema7  else -1
        v3 = 1 if ema7      > ema10 else -1
        v4 = 1 if ema5      > ema10 else -1
        score = v1 + v2 + v3 + v4

        if score > 0:
            action = SignalAction.BUY
        elif score < 0:
            action = SignalAction.SELL
        else:
            action = SignalAction.BUY if ema5 > ema10 else SignalAction.SELL

        abs_score = abs(score)
        confidence = {4: 92.0, 3: 85.0, 2: 78.0, 1: 72.0, 0: 70.0}[abs_score]

        score_str = f"+{score}" if score >= 0 else str(score)
        indicator = IndicatorResult(
            name=f"EMA-Score({score_str}/4)",
            value=round(ema5 - ema10, 6),
            signal=action,
            strength=abs_score * 25,
        )

        logger.debug(f"Votes V1={v1} V2={v2} V3={v3} V4={v4} score={score} -> {action.value} {confidence}%")
        return [indicator], action, confidence

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
        ind = indicators[0] if indicators else None
        direction = "haussiere" if action == SignalAction.BUY else "baissiere"
        score_label = ind.name if ind else "N/A"
        strength = {92.0: "Parfait (4/4)", 85.0: "Fort (3/4)", 78.0: "Modere (2/4)", 72.0: "Leger (1/4)", 70.0: "Tie"}
        lines = [
            f"Signal {action.value} ({confidence}%)",
            f"Tendance {direction} - {strength.get(confidence, score_label)}",
            f"Votes EMA: Prix/EMA5 | EMA5/EMA7 | EMA7/EMA10 | EMA5/EMA10 -> {score_label}",
        ]
        return " | ".join(lines)


# Singleton
analyzer = TechnicalAnalyzer()
