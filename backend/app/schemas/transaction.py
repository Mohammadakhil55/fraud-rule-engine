import uuid
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


def generate_tx_id() -> str:
    return f"TX-{uuid.uuid4().hex[:10].upper()}"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TransactionBase(BaseModel):
    transaction_id: str = Field(default_factory=generate_tx_id, description="Unique transaction ID")
    user_id: str = Field(..., description="ID of the user initiating the transaction")
    account_id: Optional[str] = Field(None, description="Bank/card account identifier")
    amount: float = Field(..., gt=0, description="Monetary transaction amount")
    currency: str = Field(default="INR", max_length=3, description="ISO 4217 Currency code")
    transaction_type: str = Field(default="PURCHASE", description="Type of transaction: PURCHASE, TRANSFER, WITHDRAWAL")
    timestamp: datetime = Field(default_factory=utc_now, description="Transaction timestamp in UTC")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Longitude coordinate")
    city: Optional[str] = Field(None, description="City where transaction occurred")
    country: Optional[str] = Field(None, description="Country code or name")
    merchant_name: Optional[str] = Field(None, description="Merchant or beneficiary name")
    merchant_category: Optional[str] = Field(None, description="Merchant Category Code (MCC) or category name")
    device_id: Optional[str] = Field(None, description="Unique device fingerprint")
    ip_address: Optional[str] = Field(None, description="Client IP address")


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: Optional[int] = None
    status: str = "PENDING"
    risk_score: float = 0.0
    risk_level: str = "LOW"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
