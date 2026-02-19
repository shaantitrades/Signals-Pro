"""
Backtesting Engine
Tests signal strategy against historical data.
"""
import numpy as np
import pandas as pd
from loguru import logger

from app.analysis.technical import TechnicalAnalyzer
from app.models import AssetCategory, BacktestResult, Timeframe


class BacktestEngine:
    """Walk-forward backtesting engine."""

    def __init__(self):
        self.analyzer = TechnicalAnalyzer()

    def run(
        self,
        df: pd.DataFrame,
        asset: str,
        category: AssetCategory,
        timeframe: Timeframe,
        initial_balance: float = 10000.0,
        risk_per_trade: float = 2.0,
    ) -> BacktestResult:
        """
        Run backtest on historical data.
        Walks forward through data, generating signals and simulating trades.
        """
        balance = initial_balance
        peak_balance = initial_balance
        trades: list[dict] = []
        wins = 0
        losses = 0
        total_pips = 0.0
        gross_profit = 0.0
        gross_loss = 0.0
        max_drawdown = 0.0
        returns: list[float] = []

        lookback = 30
        i = lookback

        while i < len(df) - 10:  # Leave room for trade resolution
            window = df.iloc[max(0, i - 100):i + 1]
            result = self.analyzer.analyze(window, asset, category, timeframe)

            if result and result.confidence >= 75:
                # Simulate trade
                entry = result.entry_price
                tp1 = result.tp1
                sl = result.sl

                # Walk forward to find result
                trade_result = self._resolve_trade(
                    df.iloc[i + 1:i + 50], entry, tp1, sl, result.action.value
                )

                risk_amount = balance * (risk_per_trade / 100)
                sl_distance = abs(entry - sl)
                tp_distance = abs(tp1 - entry)

                if sl_distance > 0:
                    if trade_result == "WIN":
                        pnl = risk_amount * (tp_distance / sl_distance)
                        wins += 1
                        gross_profit += pnl
                    else:
                        pnl = -risk_amount
                        losses += 1
                        gross_loss += abs(pnl)

                    balance += pnl
                    peak_balance = max(peak_balance, balance)
                    drawdown = ((peak_balance - balance) / peak_balance) * 100
                    max_drawdown = max(max_drawdown, drawdown)
                    total_pips += tp_distance if trade_result == "WIN" else -sl_distance
                    returns.append(pnl / balance)

                    trades.append({
                        "entry": entry,
                        "exit": tp1 if trade_result == "WIN" else sl,
                        "action": result.action.value,
                        "result": trade_result,
                        "pnl": round(pnl, 2),
                        "confidence": result.confidence,
                        "balance": round(balance, 2),
                    })

                i += 10  # Skip forward after trade
            else:
                i += 1

        total_trades = wins + losses
        win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else float("inf")

        # Sharpe ratio (annualized, assuming ~252 trading days)
        if len(returns) > 1:
            avg_return = np.mean(returns)
            std_return = np.std(returns)
            sharpe = (avg_return / std_return) * np.sqrt(252) if std_return > 0 else 0
        else:
            sharpe = 0

        return BacktestResult(
            asset=asset,
            total_trades=total_trades,
            wins=wins,
            losses=losses,
            win_rate=round(win_rate, 1),
            total_pips=round(total_pips, 1),
            profit_factor=round(profit_factor, 2),
            max_drawdown=round(max_drawdown, 1),
            sharpe_ratio=round(sharpe, 2),
            final_balance=round(balance, 2),
            trades=trades[-50:],  # Last 50 trades for response size
        )

    def _resolve_trade(self, df: pd.DataFrame, entry: float, tp: float, sl: float, action: str) -> str:
        """Walk through candles to determine if TP or SL is hit first."""
        for _, candle in df.iterrows():
            if action == "BUY":
                if candle["low"] <= sl:
                    return "LOSS"
                if candle["high"] >= tp:
                    return "WIN"
            else:
                if candle["high"] >= sl:
                    return "LOSS"
                if candle["low"] <= tp:
                    return "WIN"
        return "LOSS"  # Timeout = loss


backtest_engine = BacktestEngine()
