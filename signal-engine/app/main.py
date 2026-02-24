"""
SignalsPro AI Signal Generation Engine
Main FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config import settings
from app.routes import signals, health, analysis, backtest, prices
from app.services.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("🚀 SignalsPro Engine starting...")
    await start_scheduler()
    logger.info("✅ Signal analysis scheduler started")
    yield
    await stop_scheduler()
    logger.info("🛑 SignalsPro Engine stopped")


app = FastAPI(
    title="SignalsPro Signal Engine",
    description="AI-powered trading signal generation with triple validation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        settings.api_url.rsplit("/api", 1)[0] if settings.api_url else "",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(signals.router, prefix="/signals", tags=["Signals"])
app.include_router(prices.router, prefix="/prices", tags=["Prices"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(backtest.router, prefix="/backtest", tags=["Backtest"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
