import json
import requests
from datetime import datetime, timezone, timedelta

BASE_URL = "http://127.0.0.1:8000/api"

def print_separator(title):
    print("\n" + "=" * 70)
    print(f" {title.upper()} ")
    print("=" * 70)

def test_live_engine():
    # 1. Health Check
    print_separator("1. Health Check & Rules Registry")
    health = requests.get(f"{BASE_URL}/health").json()
    print("Health response:", json.dumps(health, indent=2))

    rules = requests.get(f"{BASE_URL}/rules").json()
    print(f"Registered rules count: {len(rules)}")
    for r in rules:
        print(f" - [{r['rule_key']}] {r['rule_name']} (Weight: {r['weight']}, Default: {r['severity']})")

    # 2. Test Normal Transaction
    print_separator("2. Test Normal Transaction ($35.00 Coffee & Lunch)")
    normal_payload = {
        "transaction": {
            "transaction_id": "TX-LIVE-NORMAL-001",
            "user_id": "usr_john_doe",
            "amount": 35.00,
            "currency": "USD",
            "transaction_type": "PURCHASE",
            "merchant_name": "Corner Cafe",
            "merchant_category": "FOOD_BEVERAGE",
            "city": "Seattle",
            "country": "USA",
            "latitude": 47.6062,
            "longitude": -122.3321
        },
        "save_to_db": True
    }
    res_normal = requests.post(f"{BASE_URL}/transactions/evaluate", json=normal_payload)
    print("Status:", res_normal.status_code)
    data_normal = res_normal.json()
    print("Assessment Name:", data_normal.get("assessment_name"))
    print("Transaction ID:", data_normal.get("transaction_id"))
    print("Risk Score:", data_normal.get("risk_score"))
    print("Risk Level:", data_normal.get("risk_level"))
    print("Triggered Rules:", data_normal.get("triggered_rules"))
    print("Is Flagged:", data_normal.get("is_flagged"))

    assert data_normal["risk_score"] == 0.0
    assert data_normal["risk_level"] == "LOW"
    assert data_normal["is_flagged"] is False

    # 3. Test High-Value Transaction ($8,500.00 Luxury Jewelry)
    print_separator("3. Test High-Value Transaction ($8,500.00)")
    high_val_payload = {
        "transaction": {
            "transaction_id": "TX-LIVE-HIGHVAL-002",
            "user_id": "usr_luxury_shopper",
            "amount": 8500.00,
            "currency": "USD",
            "transaction_type": "PURCHASE",
            "merchant_name": "Haute Horlogerie",
            "merchant_category": "JEWELRY",
            "city": "Beverly Hills",
            "country": "USA"
        },
        "save_to_db": True
    }
    res_high = requests.post(f"{BASE_URL}/transactions/evaluate", json=high_val_payload)
    print("Status:", res_high.status_code)
    data_high = res_high.json()
    print("Transaction ID:", data_high.get("transaction_id"))
    print("Risk Score:", data_high.get("risk_score"))
    print("Risk Level:", data_high.get("risk_level"))
    print("Triggered Rules:", data_high.get("triggered_rules"))
    print("Rule Contributions:", data_high.get("rule_contributions"))
    print("Explanations:", data_high.get("explanations"))
    print("Flag ID:", data_high.get("flag_id"))

    assert data_high["risk_score"] == 45.0
    assert data_high["risk_level"] == "MEDIUM"
    assert "Unusual Transaction Amount" in data_high["triggered_rules"]
    assert data_high["is_flagged"] is True

    # 4. Test Velocity Anomaly (Burst of 6 transactions in 5 minutes)
    print_separator("4. Test Velocity Anomaly (Burst of rapid transactions)")
    now = datetime.now(timezone.utc)
    user_vel = "usr_card_tester"
    history_vel = [
        {
            "transaction_id": f"TX-LIVE-PAST-{i}",
            "user_id": user_vel,
            "amount": 15.00 + i,
            "timestamp": (now - timedelta(minutes=i)).isoformat(),
            "currency": "USD"
        }
        for i in range(1, 6)
    ]
    velocity_payload = {
        "transaction": {
            "transaction_id": "TX-LIVE-VELOCITY-003",
            "user_id": user_vel,
            "amount": 19.99,
            "timestamp": now.isoformat(),
            "currency": "USD"
        },
        "history_override": history_vel,
        "save_to_db": True
    }
    res_vel = requests.post(f"{BASE_URL}/transactions/evaluate", json=velocity_payload)
    print("Status:", res_vel.status_code)
    data_vel = res_vel.json()
    print("Transaction ID:", data_vel.get("transaction_id"))
    print("Risk Score:", data_vel.get("risk_score"))
    print("Risk Level:", data_vel.get("risk_level"))
    print("Triggered Rules:", data_vel.get("triggered_rules"))
    print("Rule Contributions:", data_vel.get("rule_contributions"))
    print("Explanations:", data_vel.get("explanations"))
    print("Evidence Summary:", data_vel.get("evidence", {}).get("RULE_VELOCITY"))

    assert data_vel["risk_score"] == 50.0
    assert data_vel["risk_level"] == "MEDIUM"
    assert "Transaction Velocity Anomaly" in data_vel["triggered_rules"]
    assert data_vel["is_flagged"] is True

    # 5. Test Impossible Location Transaction (New York to Tokyo in 15 minutes)
    print_separator("5. Test Impossible Location (New York -> Tokyo in 15 min)")
    user_travel = "usr_teleporter"
    prior_tx_loc = {
        "transaction_id": "TX-LIVE-NYC-PRIOR",
        "user_id": user_travel,
        "amount": 75.00,
        "timestamp": (now - timedelta(minutes=15)).isoformat(),
        "city": "New York",
        "country": "USA",
        "latitude": 40.7128,
        "longitude": -74.0060
    }
    curr_tx_loc = {
        "transaction_id": "TX-LIVE-TOKYO-004",
        "user_id": user_travel,
        "amount": 95.00,
        "timestamp": now.isoformat(),
        "city": "Tokyo",
        "country": "Japan",
        "latitude": 35.6762,
        "longitude": 139.6503
    }
    loc_payload = {
        "transaction": curr_tx_loc,
        "history_override": [prior_tx_loc],
        "save_to_db": True
    }
    res_loc = requests.post(f"{BASE_URL}/transactions/evaluate", json=loc_payload)
    print("Status:", res_loc.status_code)
    data_loc = res_loc.json()
    print("Transaction ID:", data_loc.get("transaction_id"))
    print("Risk Score:", data_loc.get("risk_score"))
    print("Risk Level:", data_loc.get("risk_level"))
    print("Triggered Rules:", data_loc.get("triggered_rules"))
    print("Rule Contributions:", data_loc.get("rule_contributions"))
    print("Explanations:", data_loc.get("explanations"))
    print("Evidence Summary:", data_loc.get("evidence", {}).get("RULE_IMPOSSIBLE_LOCATION"))

    assert data_loc["risk_score"] == 70.0
    assert data_loc["risk_level"] == "HIGH"
    assert "Impossible Geographical Location" in data_loc["triggered_rules"]
    assert data_loc["is_flagged"] is True

    # 6. Test Multi-Rule Critical Transaction ($22,000 + Impossible Travel + Rapid Velocity)
    print_separator("6. Test Multiple Rules Triggered (CRITICAL Risk)")
    user_multi = "usr_fraud_syndicate"
    multi_history = [
        {
            "transaction_id": f"TX-LIVE-MULTI-PAST-{i}",
            "user_id": user_multi,
            "amount": 100.00,
            "timestamp": (now - timedelta(minutes=i*2)).isoformat(),
            "city": "Frankfurt",
            "country": "Germany",
            "latitude": 50.1109,
            "longitude": 8.6821
        }
        for i in range(1, 6)
    ]
    multi_payload = {
        "transaction": {
            "transaction_id": "TX-LIVE-CRITICAL-005",
            "user_id": user_multi,
            "amount": 22000.00,
            "timestamp": now.isoformat(),
            "currency": "USD",
            "city": "Singapore",
            "country": "Singapore",
            "latitude": 1.3521,
            "longitude": 103.8198
        },
        "history_override": multi_history,
        "save_to_db": True
    }
    res_multi = requests.post(f"{BASE_URL}/transactions/evaluate", json=multi_payload)
    print("Status:", res_multi.status_code)
    data_multi = res_multi.json()
    print("Transaction ID:", data_multi.get("transaction_id"))
    print("Risk Score:", data_multi.get("risk_score"))
    print("Risk Level:", data_multi.get("risk_level"))
    print("Triggered Rules:", data_multi.get("triggered_rules"))
    print("Rule Contributions:", data_multi.get("rule_contributions"))
    print("Explanations:", data_multi.get("explanations"))
    print("Flag ID:", data_multi.get("flag_id"))

    assert data_multi["risk_score"] == 100.0
    assert data_multi["risk_level"] == "CRITICAL"
    assert len(data_multi["triggered_rules"]) == 3
    assert data_multi["is_flagged"] is True

    print_separator("ALL LIVE API VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_live_engine()
