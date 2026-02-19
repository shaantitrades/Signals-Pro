"""Backtesting routes."""
from fastapi import APIRouter, HTTPException

from app.analysis.backtest import backtest_engine
from app.analysis.data_provider import data_provider
from app.models import BacktestRequest

router = APIRouter()


@router.post("/run")
async def run_backtest(req: BacktestRequest):
    """Run a backtest for an asset with specified parameters."""
    df = await data_provider.fetch_ohlcv(req.asset, req.timeframe.value, limit=500)
    if df is None or df.empty:
        raise HTTPException(status_code=503, detail=f"No data for {req.asset}")

    result = backtest_engine.run(
        df=df,
        asset=req.asset,
        category=req.category,
        timeframe=req.timeframe,
        initial_balance=req.initial_balance,
        risk_per_trade=req.risk_per_trade,
    )

    return {"backtest": result.model_dump()}
