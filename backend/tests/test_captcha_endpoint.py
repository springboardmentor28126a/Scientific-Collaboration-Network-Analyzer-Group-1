import os
import unittest
from unittest.mock import patch

from backend.routers.auth import captcha


class CaptchaEndpointRegressionTests(unittest.TestCase):
    def test_recaptcha_endpoint_returns_config_without_database_work(self):
        with patch.dict(os.environ, {
            "CAPTCHA_MODE": "recaptcha",
            "CAPTCHA_SITE_KEY": "public-site-key",
            "CAPTCHA_REQUIRED": "true",
        }, clear=False):
            response = captcha(None)
        self.assertEqual(response["mode"], "recaptcha")
        self.assertEqual(response["site_key"], "public-site-key")
        self.assertTrue(response["required"])
        self.assertNotIn("image", response)
        self.assertNotIn("answer", response)

    def test_development_endpoint_returns_challenge_data(self):
        expected = {"captcha_id": "challenge", "image": "data:image/svg+xml;base64,test", "expires_in": 300}
        with patch.dict(os.environ, {"CAPTCHA_MODE": "development", "CAPTCHA_REQUIRED": "true"}, clear=False), \
                patch("backend.routers.auth.issue_development_captcha", return_value=expected) as issue:
            response = captcha(object())
        issue.assert_called_once()
        self.assertEqual(response["mode"], "development")
        self.assertEqual(response["captcha_id"], "challenge")
        self.assertNotIn("site_key", response)


if __name__ == "__main__":
    unittest.main()
