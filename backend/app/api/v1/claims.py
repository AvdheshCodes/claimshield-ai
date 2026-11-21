import random
from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.claim import Claim
from app.schemas.claim import ClaimCreate, ClaimResponse, ClaimStatusUpdate

router = APIRouter(prefix="/claims", tags=["Claims Management"])

@router.post("", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
async def create_claim(
    claim_in: ClaimCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    year = claim_in.incident_date.year
    rand_seq = random.randint(10000, 99999)
    claim_number = f"CS-{year}-{rand_seq}"

    claim = Claim(
        claim_number=claim_number,
        customer_id=current_user.id,
        category=claim_in.category.upper(),
        status="SUBMITTED",
        incident_date=claim_in.incident_date,
        incident_description=claim_in.incident_description,
        incident_location=claim_in.incident_location,
        claimed_amount=claim_in.claimed_amount,
        vehicle_registration=claim_in.vehicle_registration,
        hospital_name=claim_in.hospital_name,
        garage_name=claim_in.garage_name,
        treating_doctor=claim_in.treating_doctor
    )
    db.add(claim)
    await db.commit()
    await db.refresh(claim)
    return claim

@router.get("", response_model=List[ClaimResponse])
async def list_claims(
    category: Optional[str] = None,
    claim_status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Claim)
    if current_user.role == "CUSTOMER":
        query = query.where(Claim.customer_id == current_user.id)
    if category:
        query = query.where(Claim.category == category.upper())
    if claim_status:
        query = query.where(Claim.status == claim_status.upper())

    query = query.order_by(desc(Claim.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{claim_id}", response_model=ClaimResponse)
async def get_claim(
    claim_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role == "CUSTOMER" and claim.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to claim")
    return claim

@router.patch("/{claim_id}/status", response_model=ClaimResponse)
async def update_claim_status(
    claim_id: UUID,
    update_in: ClaimStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "INVESTIGATOR"]:
        raise HTTPException(status_code=403, detail="Only authorized investigators can update claim status")

    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = update_in.status.upper()
    if update_in.approved_amount is not None:
        claim.approved_amount = update_in.approved_amount
    await db.commit()
    await db.refresh(claim)
    return claim
