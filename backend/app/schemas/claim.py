from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel

class ClaimBase(BaseModel):
    category: str # MOTOR, HEALTH, PROPERTY
    incident_date: datetime
    incident_description: str
    incident_location: Optional[str] = None
    claimed_amount: Decimal
    vehicle_registration: Optional[str] = None
    hospital_name: Optional[str] = None
    garage_name: Optional[str] = None
    treating_doctor: Optional[str] = None

class ClaimCreate(ClaimBase):
    policy_number: str

class ClaimStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    approved_amount: Optional[Decimal] = None

class ClaimResponse(ClaimBase):
    id: UUID
    claim_number: str
    customer_id: UUID
    policy_id: Optional[UUID] = None
    status: str
    approved_amount: Optional[Decimal] = None
    risk_score: Optional[int] = None
    risk_band: Optional[str] = None
    assigned_investigator_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
