import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Text, Uuid
from app.core.database import Base

class InvestigationCase(Base):
    __tablename__ = "investigation_cases"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    case_number = Column(String(100), unique=True, nullable=False, index=True)
    claim_id = Column(Uuid, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_investigator_id = Column(Uuid, ForeignKey("users.id"), nullable=True)
    status = Column(
        Enum("OPEN", "ASSIGNED", "IN_PROGRESS", "PENDING_INFORMATION", "PENDING_REVIEW", "RESOLVED", "CLOSED", name="case_status"),
        default="OPEN",
        nullable=False
    )
    priority = Column(String(20), default="MEDIUM")
    summary = Column(Text, nullable=True)
    final_decision = Column(String(50), nullable=True)
    decision_rationale = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class CaseNote(Base):
    __tablename__ = "case_notes"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    case_id = Column(Uuid, ForeignKey("investigation_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    note_text = Column(Text, nullable=False)
    is_confidential = Column(String(10), default="TRUE")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
