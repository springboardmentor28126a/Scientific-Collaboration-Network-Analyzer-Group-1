import os
import unittest
from unittest.mock import patch

from backend.services.email_service import email_configured
from backend.services.ai_service import ask_ai


class ProviderStatusTests(unittest.TestCase):
    def test_email_status_requires_host_and_from_address(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertFalse(email_configured())
        with patch.dict(os.environ, {"SMTP_HOST": "smtp.example.test", "SMTP_FROM_EMAIL": "scna@example.test"}, clear=True):
            self.assertTrue(email_configured())

    def test_ai_without_credentials_is_safe(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(RuntimeError, "AI_NOT_CONFIGURED"):
                ask_ai("test", {})


if __name__ == "__main__":
    unittest.main()
