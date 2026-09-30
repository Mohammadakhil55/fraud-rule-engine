from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.engine.base import BaseRule, haversine_distance
from app.schemas.transaction import TransactionCreate
from app.schemas.evaluation import RuleEvaluationDetail


class ImpossibleLocationRule(BaseRule):
    """
    Detects physically impossible geographical movement between successive transactions
    (the 'impossible travel / teleportation' anomaly).
    """

    rule_key = "RULE_IMPOSSIBLE_LOCATION"
    rule_name = "Impossible Geographical Location"
    description = "Flags consecutive transactions occurring across geographical distances faster than commercial air travel speed."
    default_severity = "CRITICAL"
    default_weight = 1.0
    default_config = {
        "max_speed_kmh": 900.0,  # Max typical commercial airliner cruising speed
        "min_distance_threshold_km": 50.0,
        "critical_speed_kmh": 1500.0,
    }

    def evaluate(
        self,
        transaction: TransactionCreate,
        history: Optional[List[TransactionCreate]] = None,
        custom_config: Optional[Dict[str, Any]] = None,
    ) -> RuleEvaluationDetail:
        cfg = self.get_effective_config(custom_config)
        max_speed_kmh = float(cfg.get("max_speed_kmh", 900.0))
        min_distance_km = float(cfg.get("min_distance_threshold_km", 50.0))
        crit_speed_kmh = float(cfg.get("critical_speed_kmh", 1500.0))

        # Check if current transaction has coordinates
        if transaction.latitude is None or transaction.longitude is None:
            return RuleEvaluationDetail(
                rule_key=self.rule_key,
                rule_name=self.rule_name,
                triggered=False,
                severity="LOW",
                score_contribution=0.0,
                explanation="Transaction lacks GPS coordinates; impossible travel rule skipped.",
                evidence={"status": "missing_current_coordinates"},
            )

        # Find the most recent prior transaction for the user that has coordinates
        current_time = transaction.timestamp or datetime.now(timezone.utc)
        if current_time.tzinfo is None:
            current_time = current_time.replace(tzinfo=timezone.utc)

        prior_txs = []
        if history:
            for past_tx in history:
                if past_tx.user_id != transaction.user_id:
                    continue
                if past_tx.transaction_id == transaction.transaction_id:
                    continue
                if past_tx.latitude is None or past_tx.longitude is None:
                    continue

                past_time = past_tx.timestamp or datetime.now(timezone.utc)
                if past_time.tzinfo is None:
                    past_time = past_time.replace(tzinfo=timezone.utc)

                prior_txs.append((past_time, past_tx))

        if not prior_txs:
            return RuleEvaluationDetail(
                rule_key=self.rule_key,
                rule_name=self.rule_name,
                triggered=False,
                severity="LOW",
                score_contribution=0.0,
                explanation="No prior geolocation history available for travel velocity calculation.",
                evidence={"status": "insufficient_location_history"},
            )

        # Sort by timestamp descending to get the closest transaction chronologically
        prior_txs.sort(key=lambda item: abs((current_time - item[0]).total_seconds()))
        prev_time, prev_tx = prior_txs[0]

        time_diff_seconds = abs((current_time - prev_time).total_seconds())
        # Avoid division by zero: if within 30 seconds, treat as minimum 30 seconds
        effective_seconds = max(time_diff_seconds, 30.0)
        time_diff_hours = effective_seconds / 3600.0

        distance_km = haversine_distance(
            transaction.latitude,
            transaction.longitude,
            prev_tx.latitude,
            prev_tx.longitude,
        )

        implied_speed_kmh = distance_km / time_diff_hours

        # Format location descriptions
        curr_loc_desc = (
            f"{transaction.city}, {transaction.country}"
            if transaction.city and transaction.country
            else f"({transaction.latitude:.4f}, {transaction.longitude:.4f})"
        )
        prev_loc_desc = (
            f"{prev_tx.city}, {prev_tx.country}"
            if prev_tx.city and prev_tx.country
            else f"({prev_tx.latitude:.4f}, {prev_tx.longitude:.4f})"
        )

        triggered = distance_km >= min_distance_km and implied_speed_kmh > max_speed_kmh

        if triggered:
            if implied_speed_kmh >= crit_speed_kmh or distance_km >= 2000.0:
                severity = "CRITICAL"
                score = 70.0
            else:
                severity = "HIGH"
                score = 55.0

            time_diff_mins = time_diff_seconds / 60.0
            explanation = (
                f"Impossible travel detected: User transacted in '{prev_loc_desc}' and '{curr_loc_desc}' "
                f"({distance_km:.1f} km apart) within {time_diff_mins:.1f} minutes, implying an impossible "
                f"velocity of {implied_speed_kmh:,.1f} km/h (speed limit: {max_speed_kmh:.0f} km/h)."
            )
        else:
            severity = "LOW"
            score = 0.0
            explanation = (
                f"Geographical location velocity is plausible: {distance_km:.1f} km traveled in "
                f"{time_diff_seconds / 60.0:.1f} minutes ({implied_speed_kmh:,.1f} km/h)."
            )

        evidence = {
            "current_location": {
                "latitude": transaction.latitude,
                "longitude": transaction.longitude,
                "city": transaction.city,
                "country": transaction.country,
            },
            "previous_location": {
                "transaction_id": prev_tx.transaction_id,
                "latitude": prev_tx.latitude,
                "longitude": prev_tx.longitude,
                "city": prev_tx.city,
                "country": prev_tx.country,
                "timestamp": prev_time.isoformat(),
            },
            "distance_km": round(distance_km, 2),
            "time_diff_minutes": round(time_diff_seconds / 60.0, 2),
            "implied_speed_kmh": round(implied_speed_kmh, 1),
            "max_allowed_speed_kmh": max_speed_kmh,
        }

        return RuleEvaluationDetail(
            rule_key=self.rule_key,
            rule_name=self.rule_name,
            triggered=triggered,
            severity=severity,
            score_contribution=score if triggered else 0.0,
            explanation=explanation,
            evidence=evidence,
        )
