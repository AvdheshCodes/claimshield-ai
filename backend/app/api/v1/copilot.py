from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.claim import Claim
from app.models.finding import FraudFinding
from app.schemas.copilot import CopilotQueryRequest, CopilotResponse
from app.services.copilot.rag_service import CopilotRAGService

router = APIRouter(prefix="/copilot", tags=["AI Investigation Copilot"])

@router.post("/chat", response_model=CopilotResponse)
async def query_copilot(
    query_in: CopilotQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "INVESTIGATOR"]:
        raise HTTPException(status_code=403, detail="Copilot is available to authorized investigators only")

    claim_res = await db.execute(select(Claim).where(Claim.id == query_in.claim_id))
    claim = claim_res.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    findings_res = await db.execute(select(FraudFinding).where(FraudFinding.claim_id == query_in.claim_id))
    findings = findings_res.scalars().all()

    claim_ctx = {
        "claim_number": claim.claim_number,
        "category": claim.category,
        "claimed_amount": str(claim.claimed_amount),
        "incident_date": str(claim.incident_date)
    }
    findings_ctx = [
        {
            "rule_id": f.rule_id,
            "rule_name": f.rule_name,
            "observation": f.observation,
            "evidence_page_number": f.evidence_page_number
        }
        for f in findings
    ]

    response = await CopilotRAGService.query(
        claim_context=claim_ctx,
        findings_context=findings_ctx,
        document_chunks=[],
        question=query_in.question
    )
    return response
