from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.engine.base import BaseRule
from app.schemas.transaction import TransactionCreate
from app.schemas.evaluation import RuleEvaluationDetail


class TransactionVelocityRule(BaseRule):
    """
    Evaluates transaction frequency for a user over a sliding time window.
    High transaction bursts frequently indicate card testing, automated botting,
    or account takeover.
    """

    rule_key = "RULE_VELOCITY"
    rule_name = "Transaction Velocity Anomaly"
    description = "Detects rapid successive transactions within a tight time window for the same user account."
    default_severity = "HIGH"
    default_weight = 1.0
    default_config = {
        "window_minutes": 10,
        "medium_threshold": 3,
        "high_threshold": 5,
        "critical_threshold": 8,
    }

    def evaluate(
        self,
        transaction: TransactionCreate,
        history: Optional[List[TransactionCreate]] = None,
        custom_config: Optional[Dict[str, Any]] = None,
    ) -> RuleEvaluationDetail:
        cfg = self.get_effective_config(custom_config)
        window_minutes = int(cfg.get("window_minutes", 10))
        med_th = int(cfg.get("medium_threshold", 3))
        high_th = int(cfg.get("high_threshold", 5))
        crit_th = int(cfg.get("critical_threshold", 8))

        current_time = transaction.timestamp or datetime.now(timezone.utc)
        if current_time.tzinfo is None:
            current_time = current_time.replace(tzinfo=timezone.utc)

        recent_txs = []
        if history:
            for past_tx in history:
                if past_tx.user_id != transaction.user_id:
                    continue
                if past_tx.transaction_id == transaction.transaction_id:
                    continue

                past_time = past_tx.timestamp or datetime.now(timezone.utc)
                if past_time.tzinfo is None:
                    past_time = past_time.replace(tzinfo=timezone.utc)

                time_diff_seconds = abs((current_time - past_time).total_seconds())
                if time_diff_seconds <= window_minutes * 60:
                    recent_txs.append(past_tx)

        # Total count includes current transaction
        total_count = len(recent_txs) + 1

        if total_count >= crit_th:
            severity = "CRITICAL"
            score = 80.0
            triggered = True
            explanation = (
                f"Severe transaction velocity: {total_count} transactions initiated by user '{transaction.user_id}' "
                f"within {window_minutes} minutes, exceeding critical threshold of {crit_th}."
            )
        elif total_count >= high_th:
            severity = "HIGH"
            score = 50.0
            triggered = True
            explanation = (
                f"High transaction velocity: {total_count} transactions initiated by user '{transaction.user_id}' "
                f"within {window_minutes} minutes, exceeding high threshold of {high_th}."
            )
        elif total_count >= med_th:
            severity = "MEDIUM"
            score = 35.0
            triggered = True
            explanation = (
                f"Elevated transaction velocity: {total_count} transactions initiated by user '{transaction.user_id}' "
                f"within {window_minutes} minutes, exceeding warning threshold of {med_th}."
            )
        else:
            severity = "LOW"
            score = 0.0
            triggered = False
            explanation = (
                f"Transaction velocity is normal: {total_count} transaction(s) within {window_minutes} minutes "
                f"(threshold: {med_th})."
            )

        evidence = {
            "user_id": transaction.user_id,
            "window_minutes": window_minutes,
            "observed_transactions_in_window": total_count,
            "threshold_applied": crit_th if total_count >= crit_th else (high_th if total_count >= high_th else med_th),
            "recent_prior_transaction_ids": [t.transaction_id for t in recent_txs],
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
