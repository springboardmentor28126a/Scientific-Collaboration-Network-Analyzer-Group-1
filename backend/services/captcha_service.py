import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json
import base64
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend.database.models import CaptchaChallenge

CAPTCHA_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def issue_development_captcha(db: Session) -> dict:
    answer = "".join(secrets.choice(CAPTCHA_ALPHABET) for _ in range(5))
    challenge_id = secrets.token_urlsafe(18)
    db.add(CaptchaChallenge(id=challenge_id, answer_hash=hashlib.sha256(answer.encode()).hexdigest(), expires_at=datetime.now(timezone.utc) + timedelta(minutes=5)))
    db.commit()
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="220" height="64"><rect width="100%" height="100%" fill="#eef2ff"/><text x="110" y="42" text-anchor="middle" font-family="monospace" font-size="28" letter-spacing="8" fill="#172554">{answer}</text></svg>'''
    return {"captcha_id": challenge_id, "image": "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode(), "expires_in": 300}


def verify_development_captcha(db: Session, challenge_id: str | None, answer: str | None) -> bool:
    if not challenge_id or not answer:
        return False
    challenge = db.query(CaptchaChallenge).filter(CaptchaChallenge.id == challenge_id, CaptchaChallenge.consumed_at.is_(None)).first()
    if not challenge or challenge.attempts >= 5 or challenge.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return False
    challenge.attempts += 1
    valid = secrets.compare_digest(challenge.answer_hash, hashlib.sha256(answer.strip().upper().encode()).hexdigest())
    if valid:
        challenge.consumed_at = datetime.now(timezone.utc)
    db.commit()
    return valid


def verify_captcha(token: str | None, remote_ip: str | None = None) -> bool:
    secret = os.getenv("CAPTCHA_SECRET_KEY")
    if not secret:
        # Explicit opt-in keeps local development usable while production can require it.
        return os.getenv("CAPTCHA_REQUIRED", "false").lower() != "true"
    if not token:
        return False
    payload = urlencode({"secret": secret, "response": token, "remoteip": remote_ip or ""}).encode()
    try:
        request = Request(os.getenv("CAPTCHA_VERIFY_URL", "https://www.google.com/recaptcha/api/siteverify"), data=payload)
        with urlopen(request, timeout=5) as response:
            return bool(json.loads(response.read()).get("success"))
    except Exception:
        return False
