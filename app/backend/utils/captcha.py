"""
Cloudflare Turnstile CAPTCHA verification.

Kept separate from the login router (per project convention: auth-adjacent
security helpers live in app/backend/utils/, e.g. security.py).

The backend NEVER trusts a CAPTCHA token from the frontend without calling
Cloudflare's siteverify endpoint. If TURNSTILE_SECRET_KEY isn't configured
(e.g. local development before keys are issued), verification is skipped
with a warning so the rest of the app keeps working -- but whenever a
secret key IS configured, a missing/invalid/expired token is always
rejected and never bypassed.
"""

import os
import logging

import httpx

logger = logging.getLogger("scna.captcha")

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY")

# Cloudflare's official "always passes" test secret/response pair, useful in
# local dev without needing a real Turnstile account.
_TEST_SECRET = "1x0000000000000000000000000000000AA"


class CaptchaResult:
    def __init__(self, success: bool, reason: str | None = None):
        self.success = success
        self.reason = reason


def is_captcha_configured() -> bool:
    return bool(TURNSTILE_SECRET_KEY)


def verify_turnstile_token(token: str | None, remote_ip: str | None = None) -> CaptchaResult:
    """
    Verify a Cloudflare Turnstile token against Cloudflare's siteverify API.

    Returns CaptchaResult(success=True) if:
      - TURNSTILE_SECRET_KEY is not configured (dev mode, logged as a warning), OR
      - Cloudflare confirms the token is valid.

    Returns CaptchaResult(success=False, reason=...) for every other case:
    missing token, invalid token, expired token, or the provider being
    unreachable/timing out (fail CLOSED, not open, once a secret key exists).
    """

    if not TURNSTILE_SECRET_KEY:
        logger.warning(
            "TURNSTILE_SECRET_KEY is not set - CAPTCHA verification is "
            "disabled. Configure it in app/backend/.env before deploying."
        )
        return CaptchaResult(success=True)

    if not token:
        return CaptchaResult(success=False, reason="missing_token")

    payload = {"secret": TURNSTILE_SECRET_KEY, "response": token}
    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        response = httpx.post(TURNSTILE_VERIFY_URL, data=payload, timeout=6.0)
        response.raise_for_status()
    except httpx.TimeoutException:
        logger.error("Turnstile verification timed out")
        return CaptchaResult(success=False, reason="provider_timeout")
    except httpx.HTTPError as exc:
        logger.error("Turnstile verification request failed: %s", exc)
        return CaptchaResult(success=False, reason="provider_unavailable")

    try:
        data = response.json()
    except ValueError:
        logger.error("Turnstile verification returned a non-JSON response")
        return CaptchaResult(success=False, reason="provider_unavailable")

    if data.get("success") is True:
        return CaptchaResult(success=True)

    error_codes = data.get("error-codes", [])

    if "timeout-or-duplicate" in error_codes:
        reason = "expired_token"
    elif error_codes:
        reason = "invalid_token"
    else:
        reason = "invalid_token"

    logger.info("Turnstile rejected token: %s", error_codes)
    return CaptchaResult(success=False, reason=reason)
