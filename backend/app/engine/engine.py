from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from app.engine.base import BaseRule
from app.schemas.transaction import TransactionCreate
from app.schemas.evaluation import (
    RuleEvaluationDetail,
    FraudRiskAssessmentResponse,
)
from app.rules.velocity import TransactionVelocityRule
from app.rules.amount import UnusualAmountRule
from app.rules.location import ImpossibleLocationRule


class FraudRiskEngine:
    """
    Deterministic, modular rule-based risk evaluation engine.
    New detection rules can be plugged in dynamically via `register_rule`
    without altering the core scoring matrix or evaluation workflow.
    """

    def __init__(self):
        self._rules: Dict[str, BaseRule] = {}

    def register_rule(self, rule: BaseRule) -> None:
        """Register a new or custom detection rule in the engine."""
        self._rules[rule.rule_key] = rule

    def unregister_rule(self, rule_key: str) -> Optional[BaseRule]:
        """Remove a rule from the engine by its key."""
        return self._rules.pop(rule_key, None)

    def get_rule(self, rule_key: str) -> Optional[BaseRule]:
        """Fetch a registered rule by its key."""
        return self._rules.get(rule_key)

    def list_rules(self) -> List[BaseRule]:
        """List all currently registered rules."""
        return list(self._rules.values())

    @staticmethod
    def calculate_risk_level(score: float) -> str:
        """
        Deterministic Risk Level Matrix:
        0 - 29   = LOW
        30 - 59  = MEDIUM
        60 - 79  = HIGH
        80 - 100 = CRITICAL
        """
        if score >= 80.0:
            return "CRITICAL"
        elif score >= 60.0:
            return "HIGH"
        elif score >= 30.0:
            return "MEDIUM"
        else:
            return "LOW"

    def evaluate(
        self,
        transaction: TransactionCreate,
        history: Optional[List[TransactionCreate]] = None,
        custom_configs: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> FraudRiskAssessmentResponse:
        """
        Execute deterministic evaluation across all active registered rules.
        Calculates cumulative risk score, assigns risk tier, and compiles
        full explainability evidence.
        """
        rule_details: List[RuleEvaluationDetail] = []
        triggered_rules: List[str] = []
        rule_contributions: Dict[str, float] = {}
        explanations: List[str] = []
        evidence: Dict[str, Any] = {}

        raw_score = 0.0

        for rule in self._rules.values():
            if not rule.is_active:
                continue

            rule_cfg = custom_configs.get(rule.rule_key) if custom_configs else None
            detail = rule.evaluate(transaction, history=history, custom_config=rule_cfg)
            rule_details.append(detail)

            if detail.triggered:
                contribution = round(detail.score_contribution * rule.weight, 1)
                raw_score += contribution
                triggered_rules.append(rule.rule_name)
                rule_contributions[rule.rule_key] = contribution
                explanations.append(detail.explanation)
                evidence[rule.rule_key] = detail.evidence

        # Strictly clamp aggregate score within [0.0, 100.0]
        risk_score = round(min(100.0, max(0.0, raw_score)), 1)
        risk_level = self.calculate_risk_level(risk_score)
        is_flagged = risk_level in ("MEDIUM", "HIGH", "CRITICAL")

        return FraudRiskAssessmentResponse(
            assessment_name="Rule-Based Risk Assessment",
            transaction_id=transaction.transaction_id,
            risk_score=risk_score,
            risk_level=risk_level,
            is_flagged=is_flagged,
            triggered_rules=triggered_rules,
            rule_contributions=rule_contributions,
            explanations=explanations,
            evidence=evidence,
            rule_details=rule_details,
            evaluated_at=datetime.now(timezone.utc),
        )


def build_default_engine() -> FraudRiskEngine:
    """Build and initialize engine with the core fraud detection rules."""
    engine = FraudRiskEngine()
    engine.register_rule(TransactionVelocityRule())
    engine.register_rule(UnusualAmountRule())
    engine.register_rule(ImpossibleLocationRule())
    return engine


# Global default engine instance
default_risk_engine = build_default_engine()
