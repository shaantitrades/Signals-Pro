"""Analysis routes - on-demand technical analysis."""
from fastapi import APIRouter, HTTPException

from app.analysis.data_provider import data_provider
from app.analysis.technical import analyzer
from app.models import AssetCategory, Timeframe

router = APIRouter()


@router.get("/{asset}/{timeframe}")
async def analyze_asset(asset: str, timeframe: Timeframe):
    """Run full technical analysis on an asset."""
    df = await data_provider.fetch_ohlcv(asset, timeframe.value, limit=300)
    if df is None or df.empty:
        raise HTTPException(status_code=503, detail=f"No data for {asset}")

    # Detect category
    category = _detect_category(asset)
    result = analyzer.analyze(df, asset, category, timeframe)

    if result is None:
        return {"analysis": None, "message": "No clear signal detected"}

    return {"analysis": result.model_dump()}


@router.get("/multi/{timeframe}")
async def multi_asset_analysis(timeframe: Timeframe, assets: str = "EURUSD,XAUUSD,BTCUSD"):
    """Analyze multiple assets at once."""
    asset_list = [a.strip().upper() for a in assets.split(",")]
    results = []

    for asset in asset_list[:10]:  # Max 10 at a time
        try:
            df = await data_provider.fetch_ohlcv(asset, timeframe.value)
            if df is None or df.empty:
                continue
            category = _detect_category(asset)
            result = analyzer.analyze(df, asset, category, timeframe)
            if result:
                results.append(result.model_dump())
        except Exception:
            continue

    return {"timeframe": timeframe, "results": results}


def _detect_category(asset: str) -> AssetCategory:
    """Auto-detect asset category from symbol name."""
    if asset.endswith("_OTC"):
        return AssetCategory.FOREX_OTC
    _CRYPTO = {
        "BTCUSD", "ETHUSD", "BNBUSD", "SOLUSD", "XRPUSD", "ADAUSD",
        "DOTUSD", "DOGEUSD", "AVAXUSD", "LINKUSD", "MATICUSD", "UNIUSD",
        "ATOMUSD", "LTCUSD", "NEARUSD", "APTUSD", "ARBUSD", "OPUSD",
        "FILUSD", "TRXUSD", "SHIBUSD", "XLMUSD", "ALGOUSD",
    }
    _INDICES = {
        "US30", "US500", "USTEC", "DE40", "UK100", "JP225",
        "FR40", "EU50", "AU200", "HK50", "CN50", "ES35",
        "IT40", "NL25", "CH20", "VIX", "US2000", "SG30",
    }
    _COMMODITIES = {
        "XAUUSD", "XAGUSD", "USOIL", "UKOIL", "NATGAS", "COPPER",
        "XPTUSD", "XPDUSD", "WHEAT", "CORN", "SOYBEAN", "COFFEE",
        "SUGAR", "COTTON", "COCOA", "LUMBER",
    }
    if asset in _CRYPTO:
        return AssetCategory.CRYPTO
    if asset in _INDICES:
        return AssetCategory.INDICES
    if asset in _COMMODITIES:
        return AssetCategory.COMMODITIES
    return AssetCategory.FOREX
