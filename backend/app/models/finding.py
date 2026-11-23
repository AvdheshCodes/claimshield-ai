import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Uuid
from app.core.database import Base

class FraudFinding(Base):
    __tablename__ = "fraud_findings"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    claim_id = Column(Uuid, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id = Column(String(50), nullable=False)
    rule_name = Column(String(200), nullable=False)
    severity = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    points = Column(Integer, nullable=False)

    observation = Column(Text, nullable=False)
    evidence_document_id = Column(Uuid, ForeignKey("documents.id"), nullable=True)
    evidence_page_number = Column(Integer, nullable=True)
    evidence_snippet = Column(Text, nullable=True)

    potential_alternative_explanation = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    investigator_feedback = Column(String(50), default="UNRESOLVED")  # VERIFIED, UNRESOLVED, DISMISSED

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
