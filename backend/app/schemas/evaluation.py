from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.transaction import TransactionCreate


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class RuleEvaluationDetail(BaseModel):
    rule_key: str = Field(..., description="Unique machine-readable key of the rule")
    rule_name: str = Field(..., description="Human-readable rule name")
    triggered: bool = Field(..., description="Whether the rule triggered")
    severity: str = Field(..., description="Severity level: LOW, MEDIUM, HIGH, CRITICAL")
    score_contribution: float = Field(..., description="Risk score points added by this rule")
    explanation: str = Field(..., description="Detailed explanation of the rule outcome")
    evidence: Dict[str, Any] = Field(default_factory=dict, description="Structured factual evidence observed by the rule")


class FraudRiskAssessmentResponse(BaseModel):
    assessment_name: str = Field(
        default="Rule-Based Risk Assessment",
        description="Engine assessment identity: deterministic rule-based evaluation"
    )
    transaction_id: str = Field(..., description="ID of the evaluated transaction")
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Calculated aggregate risk score (0 to 100)")
    risk_level: str = Field(..., description="Risk tier: LOW (0-29), MEDIUM (30-59), HIGH (60-79), CRITICAL (80-100)")
    is_flagged: bool = Field(..., description="True if transaction requires analyst review or automated hold")
    flag_id: Optional[str] = Field(None, description="Generated FraudFlag ID if flagged and saved to DB")
    triggered_rules: List[str] = Field(default_factory=list, description="List of rule names or keys that triggered")
    rule_contributions: Dict[str, float] = Field(
        default_factory=dict,
        description="Mapping of rule_key to its numerical risk score contribution"
    )
    explanations: List[str] = Field(
        default_factory=list,
        description="Collection of human-readable rationale statements for triggered rules"
    )
    evidence: Dict[str, Any] = Field(
        default_factory=dict,
        description="Consolidated factual evidence map across all evaluated rules"
    )
    rule_details: List[RuleEvaluationDetail] = Field(
        default_factory=list,
        description="Comprehensive evaluation breakdown for every rule checked"
    )
    evaluated_at: datetime = Field(default_factory=utc_now, description="Assessment evaluation timestamp")


class TransactionEvaluationRequest(BaseModel):
    transaction: TransactionCreate = Field(..., description="The transaction to be evaluated")
    save_to_db: bool = Field(default=True, description="Whether to persist the transaction, flag, and rule results in the database")
    history_override: Optional[List[TransactionCreate]] = Field(
        default=None,
        description="Optional explicit transaction history for testing velocity or geography without pre-populating DB"
    )
