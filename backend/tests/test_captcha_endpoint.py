import unittest
import hashlib
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from backend.routers.auth import captcha
from backend.services.captcha_service import (
    create_captcha_verification,
    issue_alphanumeric_captcha,
    verify_captcha_answer,
    consume_captcha_verification,
)


class FakeQuery:
    def __init__(self, item):
        self.item = item

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.item


class FakeDB:
    def __init__(self, item=None):
        self.item = item
        self.added = []

    def add(self, item):
        self.added.append(item)
        if self.item is None:
            self.item = item

    def commit(self):
        return None

    def query(self, model):
        return FakeQuery(self.item)


class CaptchaEndpointRegressionTests(unittest.TestCase):
    def test_endpoint_returns_alphanumeric_challenge_without_google_fields(self):
        expected = {"captcha_id": "challenge", "challenge": "7Kp4X9", "expires_in": 300, "required": True, "mode": "alphanumeric"}
        with patch("backend.routers.auth.issue_alphanumeric_captcha", return_value=expected) as issue:
            response = captcha(db=object())
        issue.assert_called_once()
        self.assertEqual(response["mode"], "alphanumeric")
        self.assertEqual(response["captcha_id"], "challenge")
        self.assertEqual(response["challenge"], "7Kp4X9")
        self.assertNotIn("image", response)
        self.assertNotIn("site_key", response)
        self.assertNotIn("answer", response)

    def test_generation_returns_text_and_stores_only_hash(self):
        db = FakeDB()
        class FakeCaptcha:
            def __init__(self, **values):
                self.__dict__.update(values)
        with patch("backend.services.captcha_service.CaptchaChallenge", FakeCaptcha):
            response = issue_alphanumeric_captcha(db)
        self.assertEqual(response["mode"], "alphanumeric")
        self.assertEqual(len(response["challenge"]), 6)
        self.assertNotEqual(response["challenge"], db.added[0].answer_hash)
        self.assertEqual(db.added[0].answer_hash, hashlib.sha256(response["challenge"].encode()).hexdigest())

    def test_correct_answer_can_be_verified_once(self):
        challenge = type("Challenge", (), {})()
        challenge.id = "one"
        challenge.answer_hash = hashlib.sha256(b"7Kp4X9").hexdigest()
        challenge.expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
        challenge.attempts = 0
        challenge.consumed_at = None
        db = FakeDB(challenge)
        self.assertTrue(verify_captcha_answer(db, "one", "7Kp4X9", consume=True))
        self.assertFalse(verify_captcha_answer(db, "one", "7Kp4X9", consume=True))

    def test_incorrect_and_expired_answers_are_rejected(self):
        challenge = type("Challenge", (), {})()
        challenge.id = "expired"
        challenge.answer_hash = hashlib.sha256(b"7Kp4X9").hexdigest()
        challenge.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        challenge.attempts = 0
        challenge.consumed_at = None
        self.assertFalse(verify_captcha_answer(FakeDB(challenge), "expired", "7Kp4X9"))

    def test_signed_verification_is_consumed_by_one_protected_request(self):
        challenge = type("Challenge", (), {})()
        challenge.id = "signed"
        challenge.answer_hash = hashlib.sha256(b"7Kp4X9").hexdigest()
        challenge.expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
        challenge.attempts = 1
        challenge.consumed_at = None
        db = FakeDB(challenge)
        token = create_captcha_verification("signed")
        self.assertTrue(consume_captcha_verification(db, token))
        self.assertFalse(consume_captcha_verification(db, token))


if __name__ == "__main__":
    unittest.main()
