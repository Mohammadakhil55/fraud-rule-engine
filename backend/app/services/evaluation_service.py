import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from app.database import models
from app.engine.engine import default_risk_engine, FraudRiskEngine
from app.schemas.transaction import TransactionCreate
from app.schemas.evaluation import (
    TransactionEvaluationRequest,
    FraudRiskAssessmentResponse,
)
from app.core.logging import logger


class EvaluationService:
    def __init__(self, engine: Optional[FraudRiskEngine] = None):
        self.engine = engine or default_risk_engine

    def evaluate_transaction(
        self,
        request: TransactionEvaluationRequest,
        db: Optional[Session] = None,
    ) -> FraudRiskAssessmentResponse:
        tx = request.transaction

        # 1. Gather historical transactions for velocity and impossible location
        history: List[TransactionCreate] = []
        if request.history_override is not None:
            history = request.history_override
        elif db is not None:
            db_history = (
                db.query(models.Transaction)
                .filter(models.Transaction.user_id == tx.user_id)
                .order_by(models.Transaction.timestamp.desc())
                .limit(50)
                .all()
            )
            for h in db_history:
                history.append(
                    TransactionCreate(
                        transaction_id=h.transaction_id,
                        user_id=h.user_id,
                        account_id=h.account_id,
                        amount=h.amount,
                        currency=h.currency,
                        transaction_type=h.transaction_type,
                        timestamp=h.timestamp,
                        latitude=h.latitude,
                        longitude=h.longitude,
                        city=h.city,
                        country=h.country,
                        merchant_name=h.merchant_name,
                        merchant_category=h.merchant_category,
                        device_id=h.device_id,
                        ip_address=h.ip_address,
                    )
                )

        # 2. Run deterministic rule evaluation
        assessment = self.engine.evaluate(transaction=tx, history=history)

        # 3. Persist to DB if requested and session available
        if request.save_to_db and db is not None:
            try:
                # Find or create Transaction in DB
                db_tx = (
                    db.query(models.Transaction)
                    .filter(models.Transaction.transaction_id == tx.transaction_id)
                    .first()
                )

                tx_status = "FLAGGED" if assessment.is_flagged else "APPROVED"

                if not db_tx:
                    db_tx = models.Transaction(
                        transaction_id=tx.transaction_id,
                        user_id=tx.user_id,
                        account_id=tx.account_id,
                        amount=tx.amount,
                        currency=tx.currency,
                        transaction_type=tx.transaction_type,
                        timestamp=tx.timestamp or datetime.now(timezone.utc),
                        latitude=tx.latitude,
                        longitude=tx.longitude,
                        city=tx.city,
                        country=tx.country,
                        merchant_name=tx.merchant_name,
                        merchant_category=tx.merchant_category,
                        device_id=tx.device_id,
                        ip_address=tx.ip_address,
                        status=tx_status,
                        risk_score=assessment.risk_score,
                        risk_level=assessment.risk_level,
                    )
                    db.add(db_tx)
                else:
                    db_tx.status = tx_status
                    db_tx.risk_score = assessment.risk_score
                    db_tx.risk_level = assessment.risk_level

                db.flush()

                fraud_flag_id = None
                # Create FraudFlag if risk_level is not LOW
                if assessment.is_flagged:
                    flag_id = f"FLG-{uuid.uuid4().hex[:10].upper()}"
                    summary = "; ".join(assessment.explanations) if assessment.explanations else "Flagged by risk engine"
                    db_flag = models.FraudFlag(
                        flag_id=flag_id,
                        transaction_id=tx.transaction_id,
                        user_id=tx.user_id,
                        risk_score=assessment.risk_score,
                        risk_level=assessment.risk_level,
                        status="NEW",
                        summary=summary,
                    )
                    db.add(db_flag)
                    db.flush()
                    fraud_flag_id = db_flag.id
                    assessment.flag_id = flag_id

                # Save individual rule results
                for detail in assessment.rule_details:
                    db_rule_result = models.RuleResult(
                        fraud_flag_id=fraud_flag_id,
                        transaction_id=tx.transaction_id,
                        rule_key=detail.rule_key,
                        rule_name=detail.rule_name,
                        triggered=detail.triggered,
                        score=detail.score_contribution,
                        severity=detail.severity,
                        explanation=detail.explanation,
                        evidence_json=json.dumps(detail.evidence),
                    )
                    db.add(db_rule_result)

                db.commit()
            except Exception as e:
                db.rollback()
                logger.error(f"Error persisting evaluation results for {tx.transaction_id}: {e}")
                # We do not fail the evaluation response if DB commit fails; response retains assessment

        return assessment


evaluation_service = EvaluationService()
