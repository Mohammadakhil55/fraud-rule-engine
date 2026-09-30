def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "FraudShield"
    assert data["status"] == "online"

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "FraudShield"

def test_readiness_endpoint(client):
    response = client.get("/api/ready")
    assert response.status_code == 200
    assert response.json()["ready"] is True
