import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_returns_access_token_and_user_payload():
    response = client.post(
        '/auth/register',
        json={
            'email': 'auth-test@example.com',
            'username': 'auth-test-user',
            'full_name': 'Auth Test User',
            'password': 'strongpassword',
            'role': 'researcher',
        },
    )
    assert response.status_code in {200, 201, 400}

    login_response = client.post(
        '/auth/login',
        json={
            'email': 'auth-test@example.com',
            'password': 'strongpassword',
        },
    )

    assert login_response.status_code == 200
    payload = login_response.json()
    assert 'access_token' in payload
    assert 'token_type' in payload
    assert 'user' in payload
    assert payload['user']['email'] == 'auth-test@example.com'
