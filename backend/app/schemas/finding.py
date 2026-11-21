from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel

class FindingResponse(BaseModel):
    id: UUID
    claim_id: UUID
    rule_id: str
    rule_name: str
    severity: str
    points: int
    observation: str
    evidence_document_id: Optional[UUID] = None
    evidence_page_number: Optional[int] = None
    evidence_snippet: Optional[str] = None
    potential_alternative_explanation: Optional[str] = None
    recommended_action: Optional[str] = None
    investigator_feedback: str
    created_at: datetime

    class Config:
        from_attributes = True

class FindingFeedbackUpdate(BaseModel):
    feedback: str # VERIFIED, UNRESOLVED, DISMISSED
    investigator_note: Optional[str] = None
