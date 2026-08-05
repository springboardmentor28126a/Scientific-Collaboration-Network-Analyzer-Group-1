import unittest
from types import SimpleNamespace

from fastapi import HTTPException

from backend.routers.publication import require_publication_owner
from backend.utils.permissions import ROLE_PERMISSIONS


class SecurityContractTests(unittest.TestCase):
    def test_system_admin_has_wildcard_permissions(self):
        self.assertIn("*", ROLE_PERMISSIONS["System Admin"])

    def test_reviewer_cannot_create_publications(self):
        self.assertNotIn("publication:create", ROLE_PERMISSIONS["Reviewer"])

    def test_publication_owner_can_manage_own_record(self):
        publication = SimpleNamespace(researcher_id=7)
        owner = SimpleNamespace(id=7, role="Researcher")
        require_publication_owner(publication, owner)

    def test_non_owner_is_rejected(self):
        publication = SimpleNamespace(researcher_id=7)
        other_user = SimpleNamespace(id=8, role="Researcher")
        with self.assertRaises(HTTPException) as context:
            require_publication_owner(publication, other_user)
        self.assertEqual(context.exception.status_code, 403)

    def test_admin_routes_include_auditable_history_contract(self):
        with open("backend/routers/admin.py", encoding="utf-8") as source_file:
            source = source_file.read()
        self.assertIn('"/moderation-history"', source)
        self.assertIn('"/users/{user_id}/warn"', source)
        self.assertIn('"/users/{user_id}/status"', source)

    def test_notification_and_conference_reminder_contracts_exist(self):
        with open("backend/routers/dashboard.py", encoding="utf-8") as source_file:
            dashboard_source = source_file.read()
        with open("backend/routers/conference.py", encoding="utf-8") as source_file:
            conference_source = source_file.read()
        self.assertIn("def run_due_reminders", dashboard_source)
        self.assertIn('notification_type == "meeting_reminder"', dashboard_source)
        self.assertIn('notification_type == "conference_reminder"', dashboard_source)
        self.assertIn('"/{conference_id}/register"', conference_source)


if __name__ == "__main__":
    unittest.main()
