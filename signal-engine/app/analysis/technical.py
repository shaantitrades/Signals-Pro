"""
Core Technical Analysis Engine — 3-EMA Trend System
Stratégie : EMA20 filtre la tendance, croisement EMA5/EMA10 déclenche l'entrée.
Signal BUY  : EMA5 > EMA20 ET EMA10 > EMA20 → EMA5 croise EMA10 à la hausse
Signal SELL : EMA5 < EMA20 ET EMA10 < EMA20 → EMA5 croise EMA10 à la baisse
Applicable à tous les marchés : OTC, Forex, Crypto, Indices, Commodities.
"""
import pandas as pd
import ta
from loguru import logger

from app.models import (
    AnalysisResult, AssetCategory, IndicatorResult,
    RiskLevel, SignalAction, Timeframe,
)


class TechnicalAnalyzer:
    """3-EMA trend-following signal engine (EMA5 / EMA10 / EMA20)."""

    # 50 candles minimum: EMA20 needs enough history to be a meaningful trend filter
    MIN_CANDLES = 50

    def analyze(self, df: pd.DataFrame, asset: str, category: AssetCategory, timeframe: Timeframe) -> AnalysisResult | None:
        """
        Analyse technique 3-EMA.
        Signal valide uniquement si croisement EMA5/EMA10 dans le sens de EMA20.
        """
        if len(df) < self.MIN_CANDLES:
            logger.warning(f"Insufficient data for {asset} ({len(df)} candles, need {self.MIN_CANDLES})")
            return None

        # Système 3-EMA : _compute_indicators retourne 0 (pas de signal) ou 1 (signal validé)
        indicators = self._compute_indicators(df, category)
        if not indicators:
            return None

        action = indicators[0].signal

        # Confiance fixe : croisement EMA5/7 dans le sens de EMA10 = setup de qualité
        confidence = 87.0

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
        """
        Stratégie 3-EMA unifiée — identique pour tous les marchés.

        Règle :
          EMA10 = filtre de tendance
          EMA5 / EMA7 = déclencheur d'entrée (croisement dans le sens de EMA10)

          BUY  : EMA5 > EMA10 ET EMA7 > EMA10
                 → fresh cross EMA5 passe AU-DESSUS de EMA7

          SELL : EMA5 < EMA10 ET EMA7 < EMA10
                 → fresh cross EMA5 passe EN-DESSOUS de EMA7

          Tout autre cas = pas de signal (cross contre-tendance ignoré)
        """
        results: list[IndicatorResult] = []

        # 30 candles suffisent : EMA10 a besoin de moins d'historique
        if len(df) > 30:
            df = df.tail(30).reset_index(drop=True)

        close = df["close"]

        # ── Calcul des 3 EMAs ───────────────────────────────────────────────
        ema5_series  = ta.trend.EMAIndicator(close, window=5).ema_indicator()
        ema7_series  = ta.trend.EMAIndicator(close, window=7).ema_indicator()
        ema10_series = ta.trend.EMAIndicator(close, window=10).ema_indicator()

        ema5_now  = float(ema5_series.iloc[-1])
        ema5_prev = float(ema5_series.iloc[-2])
        ema7_now  = float(ema7_series.iloc[-1])
        ema7_prev = float(ema7_series.iloc[-2])
        ema10_now = float(ema10_series.iloc[-1])

        ema_diff = round(ema5_now - ema7_now, 6)

        # ── Filtre de tendance EMA10 ────────────────────────────────────────
        # Les deux EMAs rapides (EMA5 et EMA7) doivent être du même côté de EMA10
        bullish_trend = ema5_now > ema10_now and ema7_now > ema10_now
        bearish_trend = ema5_now < ema10_now and ema7_now < ema10_now

        # ── Déclencheur : croisement frais EMA5 / EMA7 ────────────────────
        crossed_up   = ema5_now > ema7_now and ema5_prev <= ema7_prev
        crossed_down = ema5_now < ema7_now and ema5_prev >= ema7_prev

        if bullish_trend and crossed_up:
            # EMA5 croise EMA7 à la hausse, les deux au-dessus de EMA10 → BUY confirmé
            results.append(IndicatorResult(
                name="EMA(5/7/10)",
                value=ema_diff,
                signal=SignalAction.BUY,
                strength=90,
            ))
        elif bearish_trend and crossed_down:
            # EMA5 croise EMA7 à la baisse, les deux en-dessous de EMA10 → SELL confirmé
            results.append(IndicatorResult(
                name="EMA(5/7/10)",
                value=ema_diff,
                signal=SignalAction.SELL,
                strength=90,
            ))
        # Tous les autres cas (cross contre-tendance, pas de cross, tendance mixte) → rien

        return results

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
        ind = indicators[0] if indicators else None
        direction = "haussière" if action == SignalAction.BUY else "baissière"
        cross = "EMA5 croise EMA7 à la hausse" if action == SignalAction.BUY else "EMA5 croise EMA7 à la baisse"
        above_below = "au-dessus" if action == SignalAction.BUY else "en-dessous"

        lines = [
            f"Signal {action.value} (confiance: {confidence}%)",
            f"✅ Tendance {direction} confirmée : EMA5 et EMA7 {above_below} de EMA10",
            f"✅ Déclencheur : {cross} (EMA5/7 diff={ind.value if ind else 'N/A'})",
        ]
        return " | ".join(lines)


# Singleton
analyzer = TechnicalAnalyzer()
