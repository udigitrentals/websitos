from fastapi.testclient import TestClient
from api import app

client = TestClient(app)


def test_healthcheck():
    """Ensure the /health endpoint returns 200 OK and correct payload."""
    response = client.get("/health")
    assert response.status_code == 200
    assert "ok" in response.json()


def test_invalid_route():
    """Request to an invalid route should return 404."""
    response = client.get("/this-should-not-exist")
    assert response.status_code == 404


def test_version():
    """Ensure the /version endpoint returns API version and title."""
    response = client.get("/version")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert "title" in data
    # Optional: match expected version if you want strict check
    assert data["version"] == app.version
    assert data["title"] == app.title
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)


def test_healthcheck():
    """Ensure the /health endpoint returns 200 OK and correct payload."""
    response = client.get("/health")
    assert response.status_code == 200
    assert "ok" in response.json()


def test_invalid_route():
    """Request to an invalid route should return 404."""
    response = client.get("/this-should-not-exist")
    assert response.status_code == 404


def test_version():
    """Ensure the /version endpoint returns API version and title."""
    response = client.get("/version")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert "title" in data
    # Optional: match expected version if you want strict check
    assert data["version"] == app.version
    assert data["title"] == app.title
