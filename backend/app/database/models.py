import json
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database.session import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(32), default="FRAUD_ANALYST", nullable=False)  # ADMIN, FRAUD_ANALYST, REVIEWER
    hashed_password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(String(64), index=True, nullable=False)
    account_id = Column(String(64), index=True, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    transaction_type = Column(String(32), default="PURCHASE", nullable=False)  # PURCHASE, TRANSFER, WITHDRAWAL
    timestamp = Column(DateTime(timezone=True), default=utc_now, index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    city = Column(String(128), nullable=True)
    country = Column(String(64), nullable=True)
    merchant_name = Column(String(255), nullable=True)
    merchant_category = Column(String(64), nullable=True)
    device_id = Column(String(128), index=True, nullable=True)
    ip_address = Column(String(45), nullable=True)
    status = Column(String(32), default="PENDING", nullable=False)
    risk_score = Column(Float, default=0.0, nullable=False)
    risk_level = Column(String(32), default="LOW", index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    fraud_flag = relationship("FraudFlag", back_populates="transaction", uselist=False)
    rule_results = relationship("RuleResult", back_populates="transaction")


class RuleDefinition(Base):
    __tablename__ = "rule_definitions"

    id = Column(Integer, primary_key=True, index=True)
    rule_key = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    severity = Column(String(32), default="MEDIUM", nullable=False)
    weight = Column(Float, default=1.0, nullable=False)
    config_json = Column(Text, default="{}", nullable=False)
    triggered_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    def get_config(self):
        try:
            return json.loads(self.config_json)
        except Exception:
            return {}

    def set_config(self, cfg_dict):
        self.config_json = json.dumps(cfg_dict)


class FraudFlag(Base):
    __tablename__ = "fraud_flags"

    id = Column(Integer, primary_key=True, index=True)
    flag_id = Column(String(64), unique=True, index=True, nullable=False)
    transaction_id = Column(String(64), ForeignKey("transactions.transaction_id"), index=True, nullable=False)
    user_id = Column(String(64), index=True, nullable=False)
    risk_score = Column(Float, index=True, nullable=False)
    risk_level = Column(String(32), index=True, nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(32), default="NEW", index=True, nullable=False)  # NEW, UNDER_REVIEW, CONFIRMED_FRAUD, CLEARED, ESCALATED
    assigned_to = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    transaction = relationship("Transaction", back_populates="fraud_flag")
    rule_results = relationship("RuleResult", back_populates="fraud_flag")
    review_actions = relationship("ReviewAction", back_populates="fraud_flag", order_by="desc(ReviewAction.created_at)")
    notifications = relationship("NotificationLog", back_populates="fraud_flag")


class RuleResult(Base):
    __tablename__ = "rule_results"

    id = Column(Integer, primary_key=True, index=True)
    fraud_flag_id = Column(Integer, ForeignKey("fraud_flags.id"), nullable=True, index=True)
    transaction_id = Column(String(64), ForeignKey("transactions.transaction_id"), index=True, nullable=False)
    rule_key = Column(String(64), index=True, nullable=False)
    rule_name = Column(String(128), nullable=False)
    triggered = Column(Boolean, default=False, nullable=False)
    score = Column(Float, default=0.0, nullable=False)
    severity = Column(String(32), default="LOW", nullable=False)
    explanation = Column(Text, nullable=False)
    evidence_json = Column(Text, default="{}", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    transaction = relationship("Transaction", back_populates="rule_results")
    fraud_flag = relationship("FraudFlag", back_populates="rule_results")

    def get_evidence(self):
        try:
            return json.loads(self.evidence_json)
        except Exception:
            return {}

    def set_evidence(self, evidence_dict):
        self.evidence_json = json.dumps(evidence_dict)


class ReviewAction(Base):
    __tablename__ = "review_actions"

    id = Column(Integer, primary_key=True, index=True)
    fraud_flag_id = Column(Integer, ForeignKey("fraud_flags.id"), index=True, nullable=False)
    reviewer = Column(String(255), nullable=False)
    action = Column(String(32), nullable=False)  # REVIEW, CLEAR, CONFIRM_FRAUD, ESCALATE, ADD_NOTE
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    fraud_flag = relationship("FraudFlag", back_populates="review_actions")


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    fraud_flag_id = Column(Integer, ForeignKey("fraud_flags.id"), nullable=True, index=True)
    transaction_id = Column(String(64), index=True, nullable=False)
    channel = Column(String(32), nullable=False)  # MOCK, SES_EMAIL, SNS_TOPIC
    recipient = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    payload_json = Column(Text, nullable=False)
    status = Column(String(32), default="SENT", nullable=False)  # SENT, FAILED, QUEUED
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    fraud_flag = relationship("FraudFlag", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now, index=True)
    actor = Column(String(255), nullable=False)
    action = Column(String(64), index=True, nullable=False)
    entity = Column(String(64), index=True, nullable=False)
    entity_id = Column(String(128), index=True, nullable=False)
    description = Column(Text, nullable=False)
    metadata_json = Column(Text, default="{}", nullable=False)


class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String(64), unique=True, index=True, nullable=False)
    config_value = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
