import json
import os
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

from backend.services.ai_service import ai_configuration, ask_ai


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return json.dumps(self.payload).encode()


class OpenRouterAITests(unittest.TestCase):
    def setUp(self):
        self.environment = {
            "AI_PROVIDER": "openrouter",
            "AI_BASE_URL": "https://openrouter.ai/api/v1",
            "AI_MODEL": "openrouter/free",
            "AI_API_KEY": "test-key-that-is-never-returned",
        }

    def test_openrouter_configuration_and_root_url_normalization(self):
        with patch.dict(os.environ, self.environment, clear=False), patch("backend.services.ai_service.urlopen", return_value=FakeResponse({"choices": [{"message": {"content": "Grounded answer"}}]})) as request:
            self.assertEqual(ai_configuration(), {"provider": "openrouter", "available": True, "reason": None})
            self.assertEqual(ask_ai("Question", {"record": "data"}), "Grounded answer")
            self.assertTrue(request.call_args.args[0].full_url.endswith("/api/v1/chat/completions"))

    def test_missing_key_is_not_configured(self):
        with patch.dict(os.environ, {**self.environment, "AI_API_KEY": ""}, clear=False):
            self.assertFalse(ai_configuration()["available"])
            with self.assertRaisesRegex(RuntimeError, "AI_NOT_CONFIGURED"):
                ask_ai("Question", {})

    def test_provider_statuses_are_safe_runtime_codes(self):
        for status, code in [(401, "AI_AUTH_ERROR"), (402, "AI_PAYMENT_REQUIRED"), (429, "AI_RATE_LIMITED"), (500, "AI_PROVIDER_ERROR")]:
            with self.subTest(status=status), patch.dict(os.environ, self.environment, clear=False), patch(
                "backend.services.ai_service.urlopen",
                side_effect=HTTPError("https://openrouter.ai/api/v1/chat/completions", status, "provider error", {}, None),
            ):
                with self.assertRaisesRegex(RuntimeError, code) as error:
                    ask_ai("Question", {})
                self.assertNotIn(self.environment["AI_API_KEY"], str(error.exception))

    def test_timeout_empty_and_invalid_responses_are_handled(self):
        with patch.dict(os.environ, self.environment, clear=False):
            with patch("backend.services.ai_service.urlopen", side_effect=URLError("network failure")):
                with self.assertRaisesRegex(RuntimeError, "AI_PROVIDER_ERROR"):
                    ask_ai("Question", {})
            for payload, code in [({}, "AI_INVALID_RESPONSE"), ({"choices": [{"message": {"content": ""}}]}, "AI_EMPTY_RESPONSE")]:
                with self.subTest(code=code), patch("backend.services.ai_service.urlopen", return_value=FakeResponse(payload)):
                    with self.assertRaisesRegex(RuntimeError, code):
                        ask_ai("Question", {})


if __name__ == "__main__":
    unittest.main()
