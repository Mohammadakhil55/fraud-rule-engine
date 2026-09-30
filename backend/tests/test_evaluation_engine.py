from datetime import datetime, timezone, timedelta
import pytest
from app.schemas.transaction import TransactionCreate
from app.schemas.evaluation import TransactionEvaluationRequest
from app.engine.engine import build_default_engine, FraudRiskEngine
from app.engine.base import BaseRule
from app.schemas.evaluation import RuleEvaluationDetail


def test_normal_transaction(client):
    """Test a low-risk, everyday transaction."""
    payload = {
        "transaction": {
            "transaction_id": "TX-NORM-001",
            "user_id": "user_alice",
            "amount": 42.50,
            "currency": "USD",
            "city": "Austin",
            "country": "USA",
            "latitude": 30.2672,
            "longitude": -97.7431,
        },
        "save_to_db": False,
    }
    response = client.post("/api/transactions/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["assessment_name"] == "Rule-Based Risk Assessment"
    assert data["transaction_id"] == "TX-NORM-001"
    assert data["risk_score"] == 0.0
    assert data["risk_level"] == "LOW"
    assert data["is_flagged"] is False
    assert len(data["triggered_rules"]) == 0
    assert len(data["explanations"]) == 0


def test_high_value_transaction(client):
    """Test transaction exceeding high-value thresholds."""
    # High threshold test ($6,500)
    payload_high = {
        "transaction": {
            "transaction_id": "TX-HIGH-VAL-001",
            "user_id": "user_bob",
            "amount": 6500.00,
            "currency": "USD",
        },
        "save_to_db": False,
    }
    res_high = client.post("/api/transactions/evaluate", json=payload_high)
    assert res_high.status_code == 200
    data_high = res_high.json()

    assert data_high["risk_score"] == 45.0
    assert data_high["risk_level"] == "MEDIUM"
    assert "Unusual Transaction Amount" in data_high["triggered_rules"]
    assert "RULE_UNUSUAL_AMOUNT" in data_high["rule_contributions"]
    assert data_high["rule_contributions"]["RULE_UNUSUAL_AMOUNT"] == 45.0

    # Critical threshold test ($15,000)
    payload_crit = {
        "transaction": {
            "transaction_id": "TX-CRIT-VAL-002",
            "user_id": "user_bob",
            "amount": 15000.00,
            "currency": "USD",
        },
        "save_to_db": False,
    }
    res_crit = client.post("/api/transactions/evaluate", json=payload_crit)
    assert res_crit.status_code == 200
    data_crit = res_crit.json()

    assert data_crit["risk_score"] == 65.0
    assert data_crit["risk_level"] == "HIGH"
    assert data_crit["is_flagged"] is True


def test_velocity_anomaly(client):
    """Test rapid transaction burst within short time window."""
    now = datetime.now(timezone.utc)
    user_id = "user_velocity_test"

    # 4 historical transactions within last 4 minutes
    history = [
        {
            "transaction_id": f"TX-PAST-{i}",
            "user_id": user_id,
            "amount": 25.00,
            "timestamp": (now - timedelta(minutes=i)).isoformat(),
        }
        for i in range(1, 5)
    ]

    # 5th transaction evaluated (total 5 in window -> triggers HIGH threshold >= 5)
    payload = {
        "transaction": {
            "transaction_id": "TX-BURST-005",
            "user_id": user_id,
            "amount": 30.00,
            "timestamp": now.isoformat(),
        },
        "history_override": history,
        "save_to_db": False,
    }

    response = client.post("/api/transactions/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "Transaction Velocity Anomaly" in data["triggered_rules"]
    assert data["rule_contributions"]["RULE_VELOCITY"] == 50.0
    assert data["risk_score"] == 50.0
    assert data["risk_level"] == "MEDIUM"
    assert data["is_flagged"] is True
    assert "RULE_VELOCITY" in data["evidence"]
    assert data["evidence"]["RULE_VELOCITY"]["observed_transactions_in_window"] == 5


def test_impossible_location_transaction(client):
    """Test impossible physical travel speed between successive transactions."""
    now = datetime.now(timezone.utc)
    user_id = "user_globetrotter"

    # Prior transaction in New York 20 minutes ago
    prior_tx = {
        "transaction_id": "TX-NY-001",
        "user_id": user_id,
        "amount": 100.00,
        "timestamp": (now - timedelta(minutes=20)).isoformat(),
        "city": "New York",
        "country": "USA",
        "latitude": 40.7128,
        "longitude": -74.0060,
    }

    # Current transaction in London right now (distance ~5570 km in 20 min -> ~16,700 km/h)
    curr_tx = {
        "transaction_id": "TX-LON-002",
        "user_id": user_id,
        "amount": 120.00,
        "timestamp": now.isoformat(),
        "city": "London",
        "country": "UK",
        "latitude": 51.5074,
        "longitude": -0.1278,
    }

    payload = {
        "transaction": curr_tx,
        "history_override": [prior_tx],
        "save_to_db": False,
    }

    response = client.post("/api/transactions/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "Impossible Geographical Location" in data["triggered_rules"]
    assert data["rule_contributions"]["RULE_IMPOSSIBLE_LOCATION"] == 70.0
    assert data["risk_score"] == 70.0
    assert data["risk_level"] == "HIGH"
    assert data["is_flagged"] is True
    assert "implied_speed_kmh" in data["evidence"]["RULE_IMPOSSIBLE_LOCATION"]
    assert data["evidence"]["RULE_IMPOSSIBLE_LOCATION"]["implied_speed_kmh"] > 5000


def test_multiple_rules_triggered_critical(client):
    """Test transaction triggering multiple rules culminating in CRITICAL risk tier."""
    now = datetime.now(timezone.utc)
    user_id = "user_compromised"

    # Create 5 rapid transactions in Sydney within 5 minutes
    history = [
        {
            "transaction_id": f"TX-SYD-{i}",
            "user_id": user_id,
            "amount": 80.00,
            "timestamp": (now - timedelta(minutes=i)).isoformat(),
            "city": "Sydney",
            "country": "Australia",
            "latitude": -33.8688,
            "longitude": 151.2093,
        }
        for i in range(1, 6)
    ]

    # Current transaction: $18,000 in Paris, 1 minute later
    payload = {
        "transaction": {
            "transaction_id": "TX-PARIS-CRIT",
            "user_id": user_id,
            "amount": 18000.00,
            "timestamp": now.isoformat(),
            "city": "Paris",
            "country": "France",
            "latitude": 48.8566,
            "longitude": 2.3522,
        },
        "history_override": history,
        "save_to_db": False,
    }

    response = client.post("/api/transactions/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Rule checks:
    # 1. Amount: $18,000 -> 65 pts (Critical)
    # 2. Location: Sydney to Paris in 1 min -> 70 pts (Critical)
    # 3. Velocity: 6 txs in 5 mins -> 50 pts (High)
    # Sum = 185 pts -> Clamped to 100.0
    assert len(data["triggered_rules"]) == 3
    assert data["risk_score"] == 100.0
    assert data["risk_level"] == "CRITICAL"
    assert data["is_flagged"] is True
    assert len(data["explanations"]) == 3


def test_list_rules_endpoint(client):
    """Test rules registry metadata endpoint."""
    response = client.get("/api/rules")
    assert response.status_code == 200
    rules = response.json()

    rule_keys = [r["rule_key"] for r in rules]
    assert "RULE_VELOCITY" in rule_keys
    assert "RULE_UNUSUAL_AMOUNT" in rule_keys
    assert "RULE_IMPOSSIBLE_LOCATION" in rule_keys


def test_modular_rule_engine_extension():
    """Verify that a brand new custom rule can be registered without modifying the core engine."""
    class MockBlacklistRule(BaseRule):
        rule_key = "RULE_DEVICE_BLACKLIST"
        rule_name = "Blacklisted Device Fingerprint"
        description = "Detects hardware fingerprints associated with known fraud syndicates."
        default_severity = "CRITICAL"
        default_weight = 1.0

        def evaluate(self, transaction, history=None, custom_config=None):
            is_blacklisted = transaction.device_id == "DEV-MALICIOUS-999"
            return RuleEvaluationDetail(
                rule_key=self.rule_key,
                rule_name=self.rule_name,
                triggered=is_blacklisted,
                severity="CRITICAL" if is_blacklisted else "LOW",
                score_contribution=85.0 if is_blacklisted else 0.0,
                explanation="Malicious device detected" if is_blacklisted else "Device clean",
                evidence={"device_id": transaction.device_id},
            )

    custom_engine = FraudRiskEngine()
    custom_engine.register_rule(MockBlacklistRule())

    # Test clean device
    tx_clean = TransactionCreate(user_id="u1", amount=10.0, device_id="DEV-CLEAN-1")
    res_clean = custom_engine.evaluate(tx_clean)
    assert res_clean.risk_score == 0.0
    assert res_clean.risk_level == "LOW"

    # Test blacklisted device
    tx_bad = TransactionCreate(user_id="u2", amount=10.0, device_id="DEV-MALICIOUS-999")
    res_bad = custom_engine.evaluate(tx_bad)
    assert res_bad.risk_score == 85.0
    assert res_bad.risk_level == "CRITICAL"
    assert "Blacklisted Device Fingerprint" in res_bad.triggered_rules


def test_db_persistence_on_evaluate(client):
    """Test that evaluating with save_to_db=True persists Transaction, FraudFlag, and RuleResults."""
    from app.database.session import SessionLocal
    from app.database import models

    tx_id = "TX-DB-PERSIST-TEST-001"
    payload = {
        "transaction": {
            "transaction_id": tx_id,
            "user_id": "user_persistence",
            "amount": 9500.00,
            "currency": "USD",
        },
        "save_to_db": True,
    }

    response = client.post("/api/transactions/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_flagged"] is True
    assert data["flag_id"] is not None
    assert data["flag_id"].startswith("FLG-")

    # Verify directly in DB
    db = SessionLocal()
    try:
        saved_tx = db.query(models.Transaction).filter(models.Transaction.transaction_id == tx_id).first()
        assert saved_tx is not None
        assert saved_tx.amount == 9500.00
        assert saved_tx.status == "FLAGGED"

        saved_flag = db.query(models.FraudFlag).filter(models.FraudFlag.transaction_id == tx_id).first()
        assert saved_flag is not None
        assert saved_flag.flag_id == data["flag_id"]
        assert saved_flag.risk_level in ("MEDIUM", "HIGH", "CRITICAL")

        results = db.query(models.RuleResult).filter(models.RuleResult.transaction_id == tx_id).all()
        assert len(results) >= 3
    finally:
        db.close()

