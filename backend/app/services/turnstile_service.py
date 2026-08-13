import httpx

from app.core.config import settings


TURNSTILE_VERIFY_URL = (
    "https://challenges.cloudflare.com/turnstile/v0/siteverify"
)


async def verify_turnstile_token(
    token: str,
    remote_ip: str | None = None,
) -> bool:
    if not token:
        return False

    payload = {
        "secret": settings.TURNSTILE_SECRET,
        "response": token,
    }

    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                TURNSTILE_VERIFY_URL,
                data=payload,
            )

        response.raise_for_status()

        result = response.json()

        return result.get("success", False)

    except (httpx.HTTPError, ValueError):
        return False