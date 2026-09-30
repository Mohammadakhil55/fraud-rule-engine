from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.evaluation import (
    TransactionEvaluationRequest,
    FraudRiskAssessmentResponse,
)
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.services.evaluation_service import evaluation_service
from app.engine.engine import default_risk_engine

router = APIRouter(tags=["Fraud Risk Evaluation Engine"])


@router.post(
    "/transactions/evaluate",
    response_model=FraudRiskAssessmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate transaction with deterministic fraud rules",
    description="Calculates deterministic rule-based fraud risk score (0-100) and risk level (LOW, MEDIUM, HIGH, CRITICAL) with explainable evidence.",
)
def evaluate_transaction(
    request: TransactionEvaluationRequest,
    db: Session = Depends(get_db),
):
    return evaluation_service.evaluate_transaction(request=request, db=db)


@router.get(
    "/rules",
    response_model=List[Dict[str, Any]],
    summary="List all modular rules in the risk engine",
    description="Returns metadata and current configurations of all registered fraud detection rules.",
)
def list_rules():
    rules = default_risk_engine.list_rules()
    return [
        {
            "rule_key": r.rule_key,
            "rule_name": r.rule_name,
            "description": r.description,
            "severity": r.default_severity,
            "weight": r.weight,
            "is_active": r.is_active,
            "config": r.config,
        }
        for r in rules
    ]
