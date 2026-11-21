from uuid import UUID
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.claim import Claim
from app.models.document import Document

router = APIRouter(prefix="/customer", tags=["Customer Transparency Portal"])

@router.get("/claims")
async def get_customer_claims(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim).where(Claim.customer_id == current_user.id).order_by(desc(Claim.created_at))
    )
    claims = result.scalars().all()
    # Mask internal fraud metrics
    return [
        {
            "id": c.id,
            "claim_number": c.claim_number,
            "category": c.category,
            "status": c.status,
            "incident_date": c.incident_date,
            "claimed_amount": c.claimed_amount,
            "approved_amount": c.approved_amount,
            "created_at": c.created_at
        }
        for c in claims
    ]

@router.get("/claims/{claim_id}/timeline")
async def get_customer_safe_timeline(
    claim_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim or claim.customer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Claim record not found")

    # Safe customer-visible milestones
    timeline = [
        {"title": "Claim Submitted", "status": "COMPLETED", "date": claim.created_at},
        {"title": "Document Verification", "status": "IN_PROGRESS" if claim.status in ["PROCESSING", "DOCUMENT_VERIFICATION"] else ("COMPLETED" if claim.status in ["APPROVED", "REJECTED", "HUMAN_REVIEW", "UNDER_INVESTIGATION"] else "PENDING")},
        {"title": "Review & Assessment", "status": "IN_PROGRESS" if claim.status in ["HUMAN_REVIEW", "UNDER_INVESTIGATION"] else ("COMPLETED" if claim.status in ["APPROVED", "REJECTED"] else "PENDING")},
        {"title": "Claim Decision", "status": "COMPLETED" if claim.status in ["APPROVED", "REJECTED"] else "PENDING"}
    ]
    return {"claim_number": claim.claim_number, "timeline": timeline}
