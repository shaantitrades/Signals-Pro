"""Health check route."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "service": "signalspro-engine", "version": "1.0.0"}
