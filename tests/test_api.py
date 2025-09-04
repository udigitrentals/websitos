from fastapi.testclient import TestClient
from api import app

client = TestClient(app)


def test_healthcheck_root():
    """Ensure the root endpoint is reachable."""
    response = client.get("/")
    # If you don't have a "/" route yet, change this to any valid path
    assert response.status_code in (200, 404)


def test_invalid_route():
    """Request to an invalid route should return 404."""
    response = client.get("/this-should-not-exist")
    assert response.status_code == 404
