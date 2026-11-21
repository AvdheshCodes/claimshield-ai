import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.claim import Claim

router = APIRouter(prefix="/customer", tags=["Customer Transparency Portal"])

@router.get("/claim-status")
async def get_customer_active_claim_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns transparency status for the customer's active claim.
    Privacy-by-Design: NEVER reveals internal fraud scores, weights, or investigation tags.
    """
    result = await db.execute(
        select(Claim).order_by(desc(Claim.created_at)).limit(1)
    )
    claim = result.scalar_one_or_none()
    
    if not claim:
        return {
            "claim_number": "CS-2026-00001",
            "status": "SUBMITTED",
            "milestones": [
                {"title": "Claim Submitted", "date": "Today", "done": True},
                {"title": "Document Verification", "date": "In Progress", "done": False, "current": True},
                {"title": "Review & Assessment", "date": "Pending", "done": False},
                {"title": "Final Settlement", "date": "Pending", "done": False}
            ],
            "action_required": "Please provide a clear photograph of your vehicle chassis VIN plate and the repair garage invoice to complete verification."
        }

    status_str = claim.status
    is_under_review = status_str in ["UNDER_INVESTIGATION", "HUMAN_REVIEW", "DOCUMENT_VERIFICATION"]
    is_approved = status_str == "APPROVED"
    is_settled = status_str in ["APPROVED", "REJECTED", "CLOSED"]

    milestones = [
        {"title": "Claim Submitted", "date": claim.created_at.strftime("%d %b %Y") if claim.created_at else "21 Oct 2024", "done": True},
        {"title": "Document Verification", "date": "Verified", "done": True},
        {"title": "Review & Assessment", "date": "In Progress" if is_under_review else ("Completed" if is_settled else "Pending"), "done": is_settled, "current": is_under_review},
        {"title": "Final Settlement", "date": "Approved" if is_approved else ("Decision Issued" if is_settled else "Pending"), "done": is_settled}
    ]

    action_text = None
    if is_under_review:
        action_text = "Please provide: (1) A clear photograph of your vehicle's physical chassis VIN plate, and (2) An itemized breakdown of repair charges from the workshop to finalize your review."

    return {
        "claim_number": claim.claim_number,
        "status": claim.status,
        "milestones": milestones,
        "action_required": action_text
    }

@router.get("/claims")
async def get_customer_claims(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim).order_by(desc(Claim.created_at))
    )
    claims = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "claim_number": c.claim_number,
            "category": c.category,
            "status": c.status,
            "incident_date": c.incident_date.isoformat() if c.incident_date else None,
            "claimed_amount": float(c.claimed_amount) if c.claimed_amount else 0.0,
            "approved_amount": float(c.approved_amount) if c.approved_amount else None,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in claims
    ]
