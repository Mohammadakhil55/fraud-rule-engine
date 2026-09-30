from typing import Dict, Any, List, Optional
from app.engine.base import BaseRule
from app.schemas.transaction import TransactionCreate
from app.schemas.evaluation import RuleEvaluationDetail


class UnusualAmountRule(BaseRule):
    """
    Evaluates transaction amount against absolute risk ceilings and historical
    customer spending habits to detect out-of-band large transactions.
    """

    rule_key = "RULE_UNUSUAL_AMOUNT"
    rule_name = "Unusual Transaction Amount"
    description = "Flags transactions exceeding standard monetary thresholds or deviating significantly from historical user spending."
    default_severity = "HIGH"
    default_weight = 1.0
    default_config = {
        "medium_threshold": 2500.0,
        "high_threshold": 5000.0,
        "critical_threshold": 10000.0,
        "multiplier_threshold": 4.0,
        "min_history_count_for_multiplier": 2,
    }

    def evaluate(
        self,
        transaction: TransactionCreate,
        history: Optional[List[TransactionCreate]] = None,
        custom_config: Optional[Dict[str, Any]] = None,
    ) -> RuleEvaluationDetail:
        cfg = self.get_effective_config(custom_config)
        med_th = float(cfg.get("medium_threshold", 2500.0))
        high_th = float(cfg.get("high_threshold", 5000.0))
        crit_th = float(cfg.get("critical_threshold", 10000.0))
        multiplier_th = float(cfg.get("multiplier_threshold", 4.0))
        min_history_count = int(cfg.get("min_history_count_for_multiplier", 2))

        amount = transaction.amount
        currency = transaction.currency or "INR"
        curr_label = "₹" if currency == "INR" else f"{currency} "

        # Check user historical average
        user_history = (
            [
                t
                for t in history
                if t.user_id == transaction.user_id and t.transaction_id != transaction.transaction_id
            ]
            if history
            else []
        )

        has_history = len(user_history) >= min_history_count
        avg_amount = sum(t.amount for t in user_history) / len(user_history) if has_history else None
        multiplier_triggered = False
        ratio = None

        if has_history and avg_amount and avg_amount > 0:
            ratio = round(amount / avg_amount, 2)
            if ratio >= multiplier_th and amount >= 500.0:
                multiplier_triggered = True

        # Absolute thresholds take precedence, followed by multiplier anomaly
        if amount >= crit_th:
            triggered = True
            severity = "CRITICAL"
            score = 65.0
            explanation = (
                f"Critical transaction value: {curr_label}{amount:,.2f} exceeds absolute critical threshold "
                f"of {curr_label}{crit_th:,.2f}."
            )
        elif amount >= high_th:
            triggered = True
            severity = "HIGH"
            score = 45.0
            explanation = (
                f"High transaction value: {curr_label}{amount:,.2f} exceeds high risk threshold "
                f"of {curr_label}{high_th:,.2f}."
            )
        elif multiplier_triggered:
            triggered = True
            severity = "HIGH"
            score = 40.0
            explanation = (
                f"Historical anomaly: Transaction amount of {curr_label}{amount:,.2f} is {ratio}x higher "
                f"than the user's historical baseline average of {curr_label}{avg_amount:,.2f}."
            )
        elif amount >= med_th:
            triggered = True
            severity = "MEDIUM"
            score = 35.0
            explanation = (
                f"Elevated transaction value: {curr_label}{amount:,.2f} exceeds warning threshold "
                f"of {curr_label}{med_th:,.2f}."
            )
        else:
            triggered = False
            severity = "LOW"
            score = 0.0
            explanation = f"Transaction amount of {curr_label}{amount:,.2f} is within acceptable limits."

        evidence = {
            "amount": amount,
            "currency": currency,
            "critical_threshold": crit_th,
            "high_threshold": high_th,
            "medium_threshold": med_th,
            "historical_transactions_analyzed": len(user_history),
            "historical_average_amount": avg_amount,
            "historical_multiplier": ratio,
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
