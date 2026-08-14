"""Server-generated alphanumeric CAPTCHA support.

The challenge answer is stored only as a hash.  A successful verification
produces a short-lived signed assertion which is consumed by one protected
authentication request.
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.database.models import CaptchaChallenge
from backend.utils.security import ALGORITHM, SECRET_KEY

CAPTCHA_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
CAPTCHA_TTL_SECONDS = 300
CAPTCHA_MAX_ATTEMPTS = 5


def issue_alphanumeric_captcha(db: Session, replace_id: str | None = None) -> dict:
    if replace_id:
        invalidate_captcha(db, replace_id)
    answer = "".join(secrets.choice(CAPTCHA_ALPHABET) for _ in range(6))
    challenge_id = secrets.token_urlsafe(18)
    db.add(CaptchaChallenge(
        id=challenge_id,
        answer_hash=hashlib.sha256(answer.encode()).hexdigest(),
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=CAPTCHA_TTL_SECONDS),
    ))
    db.commit()
    # The visible challenge is intentionally returned as styled text data;
    # the answer is never returned as a second field or stored client-side.
    return {"mode": "alphanumeric", "captcha_id": challenge_id, "challenge": answer, "expires_in": CAPTCHA_TTL_SECONDS, "required": True}


def invalidate_captcha(db: Session, challenge_id: str) -> None:
    challenge = db.query(CaptchaChallenge).filter(CaptchaChallenge.id == challenge_id).first()
    if challenge and challenge.consumed_at is None:
        challenge.consumed_at = datetime.now(timezone.utc)
        db.commit()


def _challenge(db: Session, challenge_id: str | None) -> CaptchaChallenge | None:
    if not challenge_id:
        return None
    challenge = db.query(CaptchaChallenge).filter(CaptchaChallenge.id == challenge_id).first()
    if not challenge or challenge.consumed_at is not None:
        return None
    if challenge.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return None
    if challenge.attempts >= CAPTCHA_MAX_ATTEMPTS:
        return None
    return challenge


def verify_captcha_answer(db: Session, challenge_id: str | None, answer: str | None, consume: bool = False) -> bool:
    challenge = _challenge(db, challenge_id)
    if not challenge or not answer:
        return False
    challenge.attempts += 1
    valid = secrets.compare_digest(
        challenge.answer_hash,
        hashlib.sha256(answer.strip().encode()).hexdigest(),
    )
    if valid and consume:
        challenge.consumed_at = datetime.now(timezone.utc)
    db.commit()
    return valid


def create_captcha_verification(challenge_id: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(seconds=CAPTCHA_TTL_SECONDS)
    return jwt.encode({"purpose": "captcha_verification", "captcha_id": challenge_id, "exp": expires}, SECRET_KEY, algorithm=ALGORITHM)


def consume_captcha_verification(db: Session, verification: str | None) -> bool:
    if not verification:
        return False
    try:
        payload = jwt.decode(verification, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "captcha_verification":
            return False
        challenge_id = payload.get("captcha_id")
    except JWTError:
        return False
    challenge = _challenge(db, challenge_id)
    if not challenge:
        return False
    challenge.consumed_at = datetime.now(timezone.utc)
    db.commit()
    return True


# Backward-compatible internal name for callers/tests that used the old
# development implementation.  Direct verification consumes the challenge.
def verify_development_captcha(db: Session, challenge_id: str | None, answer: str | None) -> bool:
    return verify_captcha_answer(db, challenge_id, answer, consume=True)
