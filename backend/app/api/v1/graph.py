from uuid import UUID
from typing import Union
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.claim import Claim
from app.schemas.graph import GraphResponse
from app.services.relationship_graph.graph_service import RelationshipGraphService

router = APIRouter(tags=["Entity Relationship Graph"])

@router.get("/claims/{claim_id}/graph", response_model=GraphResponse)
async def get_claim_graph_by_id(
    claim_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    graph_data = await RelationshipGraphService.get_claim_neighborhood(claim.claim_number)
    return graph_data

@router.get("/graph/{claim_identifier}", response_model=GraphResponse)
async def get_claim_graph_by_identifier(
    claim_identifier: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Lookup by claim_number or by ID
    query = select(Claim).where(Claim.claim_number == claim_identifier)
    result = await db.execute(query)
    claim = result.scalar_one_or_none()
    
    target_number = claim.claim_number if claim else claim_identifier
    graph_data = await RelationshipGraphService.get_claim_neighborhood(target_number)
    return graph_data
