import base64
import hashlib
import hmac
import secrets
import struct
import time


def generate_secret() -> str:
    return base64.b32encode(secrets.token_bytes(20)).decode().rstrip("=")


def verify_totp(secret: str, code: str, window: int = 1) -> bool:
    if not code.isdigit() or len(code) != 6:
        return False
    padded = secret + "=" * (-len(secret) % 8)
    key = base64.b32decode(padded, casefold=True)
    counter = int(time.time() // 30)
    for offset in range(-window, window + 1):
        digest = hmac.new(key, struct.pack(">Q", counter + offset), hashlib.sha1).digest()
        index = digest[-1] & 15
        number = (struct.unpack(">I", digest[index:index + 4])[0] & 0x7fffffff) % 1000000
        if hmac.compare_digest(f"{number:06d}", code):
            return True
    return False


def generate_recovery_codes(count: int = 8) -> list[str]:
    return [secrets.token_urlsafe(9) for _ in range(count)]
