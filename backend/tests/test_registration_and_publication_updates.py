import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_accepts_requested_role_and_creates_user():
    email = f"register-{uuid.uuid4().hex}@example.com"
    username = f"register-user-{uuid.uuid4().hex[:8]}"

    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "username": username,
            "full_name": "Test User",
            "password": "strongpassword",
            "requested_role": "reviewer",
        },
    )

    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["email"] == email
    assert payload["username"] == username


def test_update_publication_accepts_date_only_payload():
    email = f"pub-update-{uuid.uuid4().hex}@example.com"
    username = f"pub-user-{uuid.uuid4().hex[:8]}"
    password = "strongpassword"

    client.post(
        "/auth/register",
        json={
            "email": email,
            "username": username,
            "full_name": "Publication User",
            "password": password,
        },
    )

    login_response = client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    assert login_response.status_code == 200, login_response.text
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create_response = client.post(
        "/publications/",
        json={
            "title": "A test paper",
            "abstract": "An abstract",
            "publication_type": "journal",
            "status": "draft",
            "published_date": None,
        },
        headers=headers,
    )
    assert create_response.status_code == 200, create_response.text
    publication_id = create_response.json()["id"]

    update_response = client.put(
        f"/publications/{publication_id}",
        json={
            "title": "Updated title",
            "abstract": "Updated abstract",
            "publication_type": "journal",
            "status": "submitted",
            "published_date": "2026-08-01",
        },
        headers=headers,
    )

    assert update_response.status_code == 200, update_response.text
    payload = update_response.json()
    assert payload["title"] == "Updated title"
    assert payload["status"] == "submitted"
