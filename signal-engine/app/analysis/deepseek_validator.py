"""DeepSeek AI signal validator — confirms or rejects technical signals via AI."""
import json
import httpx
from datetime import datetime, timezone
from loguru import logger

from app.config import settings
from app.models import AnalysisResult

DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"

# ── Availability tracking ─────────────────────────────────────────────────────
_deepseek_available: bool = True
_deepseek_last_fail: datetime | None = None
_deepseek_fail_count: int = 0
_deepseek_last_ok: datetime | None = None


def get_deepseek_status() -> dict:
    """Return current DeepSeek availability state for the admin panel."""
    return {
        "available": _deepseek_available,
        "last_fail": _deepseek_last_fail.isoformat() if _deepseek_last_fail else None,
        "last_ok": _deepseek_last_ok.isoformat() if _deepseek_last_ok else None,
        "consecutive_fails": _deepseek_fail_count,
        "enabled": settings.deepseek_enabled and bool(settings.deepseek_api_key),
    }


def _mark_fail(reason: str) -> None:
    global _deepseek_available, _deepseek_last_fail, _deepseek_fail_count
    _deepseek_fail_count += 1
    _deepseek_last_fail = datetime.now(timezone.utc)
    if _deepseek_available:
        _deepseek_available = False
        logger.warning(f"⚠️  DeepSeek went UNAVAILABLE — {reason} (fail #{_deepseek_fail_count})")


def _mark_ok() -> None:
    global _deepseek_available, _deepseek_fail_count, _deepseek_last_ok
    _deepseek_last_ok = datetime.now(timezone.utc)
    if not _deepseek_available:
        logger.info("✅ DeepSeek is back ONLINE")
    _deepseek_available = True
    _deepseek_fail_count = 0


def _build_prompt(result: AnalysisResult) -> str:
    indicators_text = "\n".join(
        f"  - {ind.name}: {ind.signal} (force: {ind.strength:.0f}%)"
        for ind in result.indicators
    )
    rr_ratio = "N/A"
    try:
        tp_dist = abs(result.tp1 - result.entry_price)
        sl_dist = abs(result.sl - result.entry_price)
        if sl_dist > 0:
            rr_ratio = f"{tp_dist / sl_dist:.2f}"
    except Exception:
        pass

    return f"""You are an expert trading signal validator for binary options and forex trading.
Analyze this technical signal and decide CONFIRM or REJECT.

SIGNAL:
- Asset: {result.asset}
- Direction: {result.action}
- Confidence: {result.confidence:.0f}%
- Timeframe: {result.timeframe.value}
- Entry price: {result.entry_price}
- TP1: {result.tp1}
- Stop Loss: {result.sl}
- Risk/Reward ratio: {rr_ratio}
- Risk level: {result.risk_level}

TECHNICAL INDICATORS consensus:
{indicators_text}

ENGINE REASONING:
{result.reasoning}

Rules:
1. CONFIRM if confidence >= 75% AND risk/reward > 1.0
2. CONFIRM if confidence >= 60% AND at least 2 indicators agree AND risk/reward > 0.8
3. CONFIRM if confidence >= 80% regardless of indicator count
4. REJECT only if the signal is clearly contradictory (e.g. BUY when all indicators point SELL)
5. REJECT only if risk/reward < 0.5
6. Default to CONFIRM when in doubt — the technical engine already filtered weak signals

Respond ONLY with valid JSON, nothing else:
{{"decision": "CONFIRM", "reason": "brief explanation"}}
or
{{"decision": "REJECT", "reason": "brief explanation"}}"""


async def validate_signal(result: AnalysisResult) -> tuple[bool, str]:
    """
    Validate a technical signal with DeepSeek AI.
    Returns (confirmed: bool, ai_reason: str).
    Falls back to auto-confirm if API is unavailable.
    """
    if not settings.deepseek_enabled or not settings.deepseek_api_key:
        return True, "AI validation disabled"

    prompt = _build_prompt(result)

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.post(
                DEEPSEEK_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.deepseek_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": DEEPSEEK_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 120,
                    "temperature": 0.1,
                },
            )

        if response.status_code != 200:
            _mark_fail(f"HTTP {response.status_code}")
            logger.warning(f"DeepSeek HTTP {response.status_code} — auto-confirming {result.asset}")
            return True, "AI unavailable — auto-confirmed"

        content = response.json()["choices"][0]["message"]["content"].strip()

        # Strip markdown code fences if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]

        parsed = json.loads(content)
        confirmed = parsed.get("decision", "").upper() == "CONFIRM"
        reason = parsed.get("reason", "")

        _mark_ok()
        status = "✓ CONFIRMED" if confirmed else "✗ REJECTED"
        logger.info(f"DeepSeek [{result.asset} {result.timeframe.value}] {status} — {reason}")
        return confirmed, reason

    except json.JSONDecodeError as e:
        logger.warning(f"DeepSeek JSON parse error ({result.asset}): {e} — auto-confirming")
        return True, "AI parse error — auto-confirmed"
    except Exception as e:
        _mark_fail(str(e))
        logger.warning(f"DeepSeek error ({result.asset}): {e} — auto-confirming")
        return True, "AI error — auto-confirmed"
