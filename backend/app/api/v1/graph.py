from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.claim import Claim
from app.schemas.graph import GraphResponse
from app.services.relationship_graph.graph_service import RelationshipGraphService

router = APIRouter(prefix="/claims/{claim_id}/graph", tags=["Entity Relationship Graph"])

@router.get("", response_model=GraphResponse)
async def get_claim_graph(
    claim_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "INVESTIGATOR"]:
        raise HTTPException(status_code=403, detail="Fraud graph is restricted to investigators")

    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    graph_data = await RelationshipGraphService.get_claim_neighborhood(claim.claim_number)
    return graph_data
