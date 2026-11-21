import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime, Integer, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class Claim(Base):
    __tablename__ = "claims"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_number = Column(String(100), unique=True, nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    policy_id = Column(UUID(as_uuid=True), ForeignKey("policies.id"), nullable=True)
    category = Column(Enum("MOTOR", "HEALTH", "PROPERTY", name="claim_category"), nullable=False)
    status = Column(
        Enum(
            "DRAFT", "SUBMITTED", "PROCESSING", "DOCUMENT_VERIFICATION",
            "ADDITIONAL_INFORMATION_REQUIRED", "UNDER_INVESTIGATION",
            "HUMAN_REVIEW", "APPROVED", "REJECTED", "CLOSED",
            name="claim_status"
        ),
        default="SUBMITTED",
        nullable=False,
        index=True
    )
    incident_date = Column(DateTime(timezone=True), nullable=False)
    incident_description = Column(Text, nullable=False)
    incident_location = Column(String(255), nullable=True)
    claimed_amount = Column(Numeric(12, 2), nullable=False)
    approved_amount = Column(Numeric(12, 2), nullable=True)

    # Identifiers
    vehicle_registration = Column(String(50), nullable=True)
    hospital_name = Column(String(200), nullable=True)
    garage_name = Column(String(200), nullable=True)
    treating_doctor = Column(String(150), nullable=True)

    # Risk Engine
    risk_score = Column(Integer, nullable=True)
    risk_band = Column(Enum("LOW", "MEDIUM", "HIGH", "VERY_HIGH", name="risk_band"), nullable=True)
    assigned_investigator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
