import unittest

from backend.services.mfa_service import generate_recovery_codes, generate_secret, verify_totp


class AuthFeatureTests(unittest.TestCase):
    def test_totp_secret_is_random_and_recovery_codes_are_unique(self):
        self.assertNotEqual(generate_secret(), generate_secret())
        codes = generate_recovery_codes()
        self.assertEqual(len(codes), 8)
        self.assertEqual(len(set(codes)), 8)

    def test_totp_rejects_malformed_codes(self):
        secret = generate_secret()
        self.assertFalse(verify_totp(secret, "123"))
        self.assertFalse(verify_totp(secret, "abcdef"))


if __name__ == "__main__":
    unittest.main()
