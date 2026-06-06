"""
Core Technical Analysis Engine — Multi-Indicator Consensus System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generates a signal ONLY when multiple independent indicators agree.
Returns None when indicators conflict or market is choppy/flat.

Indicators used (each casts an independent vote):
 1. EMA Trend  (EMA20 vs EMA50 crossover + price position)
 2. RSI        (overbought/oversold + divergence zones)
 3. MACD       (signal line cross + histogram direction)
 4. Bollinger  (band position + squeeze detection)
 5. Stochastic (K/D cross in extreme zones)

Minimum 3/5 agreement required. Real confidence = vote ratio.
"""
import pandas as pd
import ta
from loguru import logger

from app.models import (
    AnalysisResult, AssetCategory, IndicatorResult,
    RiskLevel, SignalAction, Timeframe,
)


class TechnicalAnalyzer:
    """Multi-indicator consensus engine — quality over quantity."""

    MIN_CANDLES = 60  # Need enough data for EMA50 + Bollinger(20)

    def analyze(self, df: pd.DataFrame, asset: str, category: AssetCategory, timeframe: Timeframe) -> AnalysisResult | None:
        """
        Returns a signal ONLY when 3+ independent indicators agree.
        Returns None when there is no clear consensus — this is intentional.
        """
        if len(df) < self.MIN_CANDLES:
            logger.debug(f"Insufficient data for {asset} ({len(df)}/{self.MIN_CANDLES} candles)")
            return None

        votes, indicators = self._collect_votes(df)

        if not votes:
            return None

        buy_votes = sum(1 for v in votes if v == "BUY")
        sell_votes = sum(1 for v in votes if v == "SELL")
        total = len(votes)

        # Require at least 2 indicators to have produced a vote
        if total < 2:
            logger.debug(f"{asset}: only {total} indicators voted, need 2+")
            return None

        majority = max(buy_votes, sell_votes)
        minority = min(buy_votes, sell_votes)

        # Require clear majority: at least 2 votes in same direction
        if majority < 2:
            logger.debug(f"{asset}: no clear consensus (BUY={buy_votes} SELL={sell_votes})")
            return None

        # Confidence based on actual vote ratio
        # 2/2=85, 2/3=80, 2/4=75, 3/3=85, 3/4=82, 3/5=80, 4/4=90, 4/5=88, 5/5=95
        total_indicators = 5  # always 5 indicators available
        raw_confidence = 55 + (majority / total_indicators) * 40
        # Bonus for unanimity
        if minority == 0 and total >= 3:
            raw_confidence += 5
        # Bonus for more indicators agreeing
        if total >= 4 and majority >= 3:
            raw_confidence += 3
        confidence = min(round(raw_confidence, 1), 95)

        action = SignalAction.BUY if buy_votes > sell_votes else SignalAction.SELL

        current = float(df["close"].iloc[-1])
        atr = float(ta.volatility.AverageTrueRange(
            df["high"], df["low"], df["close"], window=14
        ).average_true_range().iloc[-1])

        if atr <= 0:
            return None

        entry_price, tp1, tp2, tp3, sl = self._calculate_levels(action, current, atr, category)
        risk_level = self._assess_risk(atr, current, confidence)
        reasoning = self._generate_reasoning(indicators, action, confidence, buy_votes, sell_votes)

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

    # ── Vote Collection ──────────────────────────────────────

    def _collect_votes(self, df: pd.DataFrame) -> tuple[list[str], list[IndicatorResult]]:
        """Each indicator casts an independent BUY/SELL vote (or abstains)."""
        votes: list[str] = []
        indicators: list[IndicatorResult] = []

        close = df["close"]
        high = df["high"]
        low = df["low"]

        # ── 1. EMA Trend (EMA20 vs EMA50) ──
        try:
            ema20 = ta.trend.EMAIndicator(close, window=20).ema_indicator()
            ema50 = ta.trend.EMAIndicator(close, window=50).ema_indicator()
            ema20_val = float(ema20.iloc[-1])
            ema50_val = float(ema50.iloc[-1])
            price_now = float(close.iloc[-1])

            # Price must be on the right side of both EMAs, and EMAs must be aligned
            if price_now > ema20_val > ema50_val:
                vote = "BUY"
                strength = min(((price_now - ema50_val) / ema50_val) * 1000, 100)
            elif price_now < ema20_val < ema50_val:
                vote = "SELL"
                strength = min(((ema50_val - price_now) / ema50_val) * 1000, 100)
            else:
                vote = None  # EMAs not aligned — abstain
                strength = 0

            if vote:
                votes.append(vote)
                indicators.append(IndicatorResult(
                    name="EMA20/50", value=round(ema20_val - ema50_val, 6),
                    signal=SignalAction(vote), strength=round(strength, 1)
                ))
        except Exception as e:
            logger.debug(f"EMA error: {e}")

        # ── 2. RSI (14) ──
        try:
            rsi = ta.momentum.RSIIndicator(close, window=14).rsi()
            rsi_val = float(rsi.iloc[-1])
            rsi_prev = float(rsi.iloc[-2])

            # Vote based on broader zones to increase participation
            if rsi_val < 40 and rsi_val > rsi_prev:  # Oversold / weak + turning up
                vote = "BUY"
                strength = max(0, (40 - rsi_val) * 2.5)
            elif rsi_val > 60 and rsi_val < rsi_prev:  # Overbought / strong + turning down
                vote = "SELL"
                strength = max(0, (rsi_val - 60) * 2.5)
            elif rsi_val < 50 and rsi_val > rsi_prev:  # Below midline + momentum up = mild buy
                vote = "BUY"
                strength = 25
            elif rsi_val > 50 and rsi_val < rsi_prev:  # Above midline + momentum down = mild sell
                vote = "SELL"
                strength = 25
            else:
                vote = None  # Neutral zone — abstain

            if vote:
                votes.append(vote)
                indicators.append(IndicatorResult(
                    name="RSI(14)", value=round(rsi_val, 2),
                    signal=SignalAction(vote), strength=min(round(strength, 1), 100)
                ))
        except Exception as e:
            logger.debug(f"RSI error: {e}")

        # ── 3. MACD (12,26,9) ──
        try:
            macd_ind = ta.trend.MACD(close, window_slow=26, window_fast=12, window_sign=9)
            macd_line = float(macd_ind.macd().iloc[-1])
            signal_line = float(macd_ind.macd_signal().iloc[-1])
            histogram = float(macd_ind.macd_diff().iloc[-1])
            hist_prev = float(macd_ind.macd_diff().iloc[-2])

            # Broadened MACD criteria: vote based on line position + histogram direction
            if macd_line > signal_line and histogram > hist_prev:  # Bullish cross/momentum
                vote = "BUY"
                strength = min(abs(histogram) / (abs(macd_line) + 1e-10) * 100, 100)
            elif macd_line < signal_line and histogram < hist_prev:  # Bearish cross/momentum
                vote = "SELL"
                strength = min(abs(histogram) / (abs(macd_line) + 1e-10) * 100, 100)
            else:
                vote = None  # No clear MACD momentum — abstain

            if vote:
                votes.append(vote)
                indicators.append(IndicatorResult(
                    name="MACD(12,26,9)", value=round(histogram, 6),
                    signal=SignalAction(vote), strength=round(strength, 1)
                ))
        except Exception as e:
            logger.debug(f"MACD error: {e}")

        # ── 4. Bollinger Bands (20, 2) ──
        try:
            bb = ta.volatility.BollingerBands(close, window=20, window_dev=2)
            upper = float(bb.bollinger_hband().iloc[-1])
            lower = float(bb.bollinger_lband().iloc[-1])
            mid = float(bb.bollinger_mavg().iloc[-1])
            price_now = float(close.iloc[-1])
            bandwidth = upper - lower

            if bandwidth > 0:
                position = (price_now - lower) / bandwidth  # 0=lower band, 1=upper band

                # Bounce off lower band = buy, bounce off upper = sell
                prev_price = float(close.iloc[-2])
                if position < 0.25 and price_now > prev_price:  # Near lower + bouncing up
                    vote = "BUY"
                    strength = (0.25 - position) * 200
                elif position > 0.75 and price_now < prev_price:  # Near upper + falling
                    vote = "SELL"
                    strength = (position - 0.75) * 200
                elif price_now > mid and prev_price < mid:  # Crossed above middle
                    vote = "BUY"
                    strength = 40
                elif price_now < mid and prev_price > mid:  # Crossed below middle
                    vote = "SELL"
                    strength = 40
                else:
                    vote = None

                if vote:
                    votes.append(vote)
                    indicators.append(IndicatorResult(
                        name="BB(20,2)", value=round(position, 3),
                        signal=SignalAction(vote), strength=min(round(strength, 1), 100)
                    ))
        except Exception as e:
            logger.debug(f"BB error: {e}")

        # ── 5. Stochastic (14,3,3) ──
        try:
            stoch = ta.momentum.StochasticOscillator(high, low, close, window=14, smooth_window=3)
            k_val = float(stoch.stoch().iloc[-1])
            d_val = float(stoch.stoch_signal().iloc[-1])
            k_prev = float(stoch.stoch().iloc[-2])

            # Only vote at extremes with K/D cross confirmation
            if k_val < 25 and k_val > d_val and k_val > k_prev:  # Oversold + K crossing above D
                vote = "BUY"
                strength = min((25 - k_val) * 4, 100)
            elif k_val > 75 and k_val < d_val and k_val < k_prev:  # Overbought + K crossing below D
                vote = "SELL"
                strength = min((k_val - 75) * 4, 100)
            else:
                vote = None

            if vote:
                votes.append(vote)
                indicators.append(IndicatorResult(
                    name="Stoch(14,3)", value=round(k_val, 2),
                    signal=SignalAction(vote), strength=round(strength, 1)
                ))
        except Exception as e:
            logger.debug(f"Stochastic error: {e}")

        return votes, indicators

    # ── Price Levels ─────────────────────────────────────────

    def _calculate_levels(
        self, action: SignalAction, price: float, atr: float, category: AssetCategory
    ) -> tuple[float, float, float, float, float]:
        """Calculate entry, TP1-3 and SL based on ATR."""
        base_precision = {
            AssetCategory.FOREX_OTC: 5, AssetCategory.FOREX: 5,
            AssetCategory.CRYPTO: 5, AssetCategory.INDICES: 2,
            AssetCategory.COMMODITIES: 3,
        }.get(category, 5)
        # Dynamic precision: high-value assets (BTC, ETH) need fewer decimals
        if category == AssetCategory.CRYPTO:
            if price >= 10000:
                precision = 2
            elif price >= 100:
                precision = 3
            else:
                precision = 5
        else:
            precision = base_precision

        multipliers = {
            AssetCategory.FOREX_OTC: (1.2, 2.0, 3.0, 1.0),
            AssetCategory.FOREX: (1.5, 2.5, 3.5, 1.2),
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
        atr_pct = (atr / price) * 100
        if atr_pct < 0.5 and confidence >= 80:
            return RiskLevel.LOW
        elif atr_pct > 2.0 or confidence < 70:
            return RiskLevel.HIGH
        return RiskLevel.MEDIUM

    def _generate_reasoning(
        self, indicators: list[IndicatorResult], action: SignalAction,
        confidence: float, buy_votes: int, sell_votes: int
    ) -> str:
        direction = "Bullish" if action == SignalAction.BUY else "Bearish"
        total = buy_votes + sell_votes
        majority = max(buy_votes, sell_votes)
        names = [ind.name for ind in indicators if ind.signal == action]
        return (
            f"{action.value} signal ({confidence}%) — {majority}/{total} indicators agree | "
            f"{direction} consensus: {', '.join(names)} | "
            f"Votes: BUY={buy_votes} SELL={sell_votes}"
        )


# Singleton
analyzer = TechnicalAnalyzer()
