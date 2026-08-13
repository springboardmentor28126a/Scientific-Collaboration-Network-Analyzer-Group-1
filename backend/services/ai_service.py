"""SCNA-aware AI integration using an OpenAI-compatible HTTP API."""
import json
import os
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)


def ask_ai(question: str, context: dict) -> str:
    api_key = os.getenv("AI_API_KEY")
    if not api_key or not os.getenv("AI_MODEL"):
        raise RuntimeError("AI_NOT_CONFIGURED")
    endpoint = os.getenv("AI_BASE_URL", "https://api.openai.com/v1/chat/completions")
    body = json.dumps({
        "model": os.getenv("AI_MODEL", "gpt-4o-mini"),
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
        raise RuntimeError("AI_PROVIDER_ERROR") from exc
    except (URLError, TimeoutError, ValueError, KeyError) as exc:
        logger.warning("AI provider request failed: %s", type(exc).__name__)
        raise RuntimeError("AI_PROVIDER_ERROR") from exc
    return data["choices"][0]["message"]["content"]
