"""SCNA-aware AI integration using an OpenAI-compatible HTTP API."""
import json
import os
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)


def _provider_endpoint() -> str:
    base_url = os.getenv("AI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    return base_url if base_url.endswith("/chat/completions") else f"{base_url}/chat/completions"


def ai_configuration() -> dict:
    provider = os.getenv("AI_PROVIDER", "openai-compatible")
    configured = bool(os.getenv("AI_API_KEY", "").strip() and os.getenv("AI_MODEL", "").strip())
    return {"provider": provider, "available": configured, "reason": None if configured else "not_configured"}


def ask_ai(question: str, context: dict) -> str:
    api_key = os.getenv("AI_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()
    if not api_key or not model:
        raise RuntimeError("AI_NOT_CONFIGURED")
    endpoint = _provider_endpoint()
    body = json.dumps({
        "model": model,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": "You are SCNA Research AI. Use only the supplied database facts. Label AI suggestions clearly and never invent researchers, publications, citations, or institutions."},
            {"role": "user", "content": json.dumps({"question": question, "authorized_scna_context": context})},
        ],
    }).encode()
    request = Request(endpoint, data=body, headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=30) as response:
            data = json.loads(response.read())
    except HTTPError as exc:
        logger.warning("AI provider returned HTTP status %s", exc.code)
        error_code = {
            401: "AI_AUTH_ERROR",
            402: "AI_PAYMENT_REQUIRED",
            429: "AI_RATE_LIMITED",
        }.get(exc.code, "AI_PROVIDER_ERROR")
        raise RuntimeError(error_code) from exc
    except (URLError, TimeoutError, ValueError, KeyError) as exc:
        logger.warning("AI provider request failed: %s", type(exc).__name__)
        raise RuntimeError("AI_PROVIDER_ERROR") from exc
    try:
        answer = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("AI provider returned an unexpected response shape")
        raise RuntimeError("AI_INVALID_RESPONSE") from exc
    if not isinstance(answer, str) or not answer.strip():
        logger.warning("AI provider returned an empty response")
        raise RuntimeError("AI_EMPTY_RESPONSE")
    return answer.strip()
