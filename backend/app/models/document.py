import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, BigInteger, DateTime, Numeric, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(UUID(as_uuid=True), ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    document_type = Column(String(100), nullable=False)
    original_filename = Column(String(255), nullable=False)
    stored_path = Column(String(500), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), nullable=False)
    sha256_hash = Column(String(64), nullable=False, index=True)

    # OCR
    ocr_status = Column(String(50), default="PENDING")
    raw_extracted_text = Column(Text, nullable=True)
    extracted_metadata = Column(JSONB, nullable=True)
    extraction_confidence = Column(Numeric(4, 2), nullable=True)

    # Forensics
    has_tampering_indicators = Column(Boolean, default=False)
    forensic_details = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
