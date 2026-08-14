import unittest
from pathlib import Path

from pydantic import ValidationError

from backend.schemas.user import RegisterRequest
from backend.services.publication_ai_service import extract_publication_text
from backend.services.research_intelligence_service import _terms
from types import SimpleNamespace


ROOT = Path(__file__).resolve().parents[2]


class RequestedScopeTests(unittest.TestCase):
    def test_registration_defaults_country_to_india_and_requires_confirmation(self):
        payload = RegisterRequest(
            name="Research User",
            email="research@example.com",
            password="strongpass",
            confirm_password="strongpass",
            role="Researcher",
        )
        self.assertEqual(payload.country, "India")
        with self.assertRaises(ValidationError):
            RegisterRequest(
                name="Research User",
                email="research@example.com",
                password="strongpass",
                role="Researcher",
            )

    def test_password_login_has_no_mfa_challenge_but_otp_remains(self):
        auth = (ROOT / "backend/routers/auth.py").read_text(encoding="utf-8")
        login = (ROOT / "client/src/pages/Login.jsx").read_text(encoding="utf-8")
        self.assertNotIn("existing_user.mfa_enabled", auth)
        self.assertNotIn("MFA code", login)
        self.assertIn("/auth/request-otp", login)

    def test_notification_and_publication_scope_contracts(self):
        auth = (ROOT / "backend/routers/auth.py").read_text(encoding="utf-8")
        verification = (ROOT / "backend/routers/verification.py").read_text(encoding="utf-8")
        admin = (ROOT / "backend/routers/admin.py").read_text(encoding="utf-8")
        publication = (ROOT / "backend/routers/publication.py").read_text(encoding="utf-8")
        self.assertIn('notification_type="user_registered"', auth)
        self.assertIn('notification_type="verification_requested"', verification)
        self.assertIn('@router.post("/notify-user")', admin)
        self.assertIn('User.role != "System Admin"', publication)
        self.assertIn('"page_count"', publication)
        self.assertIn("Publication.researcher_id == current_user.id", publication)

    def test_reviewer_overview_and_reports_use_real_scoped_data(self):
        reviewer = (ROOT / "backend/routers/reviewer.py").read_text(encoding="utf-8")
        reports = (ROOT / "backend/routers/reports.py").read_text(encoding="utf-8")
        self.assertIn('@router.get("/overview")', reviewer)
        for metric in ["researchers", "reviewers", "publications", "pending_reviews", "completed_reviews"]:
            self.assertIn(f'"{metric}"', reviewer)
        self.assertIn('@router.get("/csv")', reports)
        self.assertIn("ROLE_REPORTS", reports)
        self.assertIn("Content-Disposition", reports)

    def test_ai_recommendations_are_researcher_only_and_secrets_stay_server_side(self):
        ai = (ROOT / "backend/routers/ai.py").read_text(encoding="utf-8")
        service = (ROOT / "backend/services/ai_service.py").read_text(encoding="utf-8")
        self.assertIn('User.role == "Researcher"', ai)
        self.assertIn('os.getenv("AI_API_KEY"', service)
        self.assertNotIn('AI_API_KEY', (ROOT / "client/src/pages/ResearchAI.jsx").read_text(encoding="utf-8"))

    def test_publication_ai_missing_content_returns_no_text(self):
        publication = SimpleNamespace(abstract=None, pdf_file=None)
        self.assertIsNone(extract_publication_text(publication))

    def test_publication_ai_routes_require_publication_view_and_ground_content(self):
        ai = (ROOT / "backend/routers/ai.py").read_text(encoding="utf-8")
        self.assertEqual(ai.count('Depends(require_permission("publication:view"))'), 2)
        self.assertIn("Publication content is not available for AI analysis.", ai)
        self.assertIn("publication_context(publication, content)", ai)

    def test_research_intelligence_uses_analytics_permission_and_historical_guard(self):
        ai = (ROOT / "backend/routers/ai.py").read_text(encoding="utf-8")
        intelligence = (ROOT / "backend/services/research_intelligence_service.py").read_text(encoding="utf-8")
        self.assertIn('@router.get("/research-trends")', ai)
        self.assertIn('Depends(require_permission("analytics:view"))', ai)
        self.assertEqual(_terms("Computer Vision, AI; Robotics"), ["Computer Vision", "AI", "Robotics"])
        self.assertIn("Insufficient historical data to determine a reliable trend.", intelligence)
        self.assertIn("potential_opportunities", intelligence)


if __name__ == "__main__":
    unittest.main()
