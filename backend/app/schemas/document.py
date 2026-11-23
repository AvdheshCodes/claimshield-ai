from datetime import datetime
from typing import Optional, Any, Dict
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: UUID
    claim_id: UUID
    uploaded_by: Optional[UUID] = None
    document_type: str
    original_filename: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    ocr_status: str
    extracted_metadata: Optional[Dict[str, Any]] = None
    extraction_confidence: Optional[Decimal] = None
    has_tampering_indicators: bool
    forensic_details: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
