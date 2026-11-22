import uuid
from typing import Union
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.claim import Claim
from app.models.finding import FraudFinding
from app.models.document import Document
from app.schemas.copilot import CopilotQueryRequest, CopilotResponse
from app.services.copilot.rag_service import CopilotRAGService

router = APIRouter(prefix="/copilot", tags=["AI Investigation Copilot"])

async def handle_copilot_query(
    query_in: CopilotQueryRequest,
    current_user: User,
    db: AsyncSession
) -> CopilotResponse:
    # Try finding claim by UUID or by claim_number
    claim = None
    try:
        if isinstance(query_in.claim_id, uuid.UUID):
            c_uuid = query_in.claim_id
        else:
            c_uuid = uuid.UUID(str(query_in.claim_id))
        claim_res = await db.execute(select(Claim).where(Claim.id == c_uuid))
        claim = claim_res.scalar_one_or_none()
    except (ValueError, TypeError):
        pass

    if not claim:
        # Try finding by claim_number
        claim_res = await db.execute(select(Claim).where(Claim.claim_number == str(query_in.claim_id)))
        claim = claim_res.scalar_one_or_none()

    if not claim:
        # Provide graceful response based on inquiry
        return await CopilotRAGService.query(
            claim_context={"claim_number": str(query_in.claim_id), "category": "MOTOR", "claimed_amount": "Unknown"},
            findings_context=[],
            document_chunks=[],
            question=query_in.question
        )

    findings_res = await db.execute(select(FraudFinding).where(FraudFinding.claim_id == claim.id))
    findings = findings_res.scalars().all()

    # Load uploaded documents for full text & metadata grounding
    docs_res = await db.execute(select(Document).where(Document.claim_id == claim.id))
    docs = docs_res.scalars().all()
    doc_chunks = [
        {
            "id": str(d.id),
            "filename": d.original_filename,
            "document_type": d.document_type,
            "text": d.raw_extracted_text or "",
            "metadata": d.extracted_metadata or {},
            "tampering": d.has_tampering_indicators,
            "forensic_details": d.forensic_details or {}
        }
        for d in docs
    ]

    claim_ctx = {
        "claim_number": claim.claim_number,
        "category": claim.category,
        "claimed_amount": str(claim.claimed_amount),
        "incident_date": str(claim.incident_date),
        "vehicle_registration": claim.vehicle_registration,
        "garage_name": claim.garage_name
    }
    findings_ctx = [
        {
            "rule_id": f.rule_id,
            "rule_name": f.rule_name,
            "observation": f.observation,
            "evidence_page_number": f.evidence_page_number or 1,
            "evidence_snippet": f.evidence_snippet
        }
        for f in findings
    ]

    return await CopilotRAGService.query(
        claim_context=claim_ctx,
        findings_context=findings_ctx,
        document_chunks=doc_chunks,
        question=query_in.question
    )

@router.post("/chat", response_model=CopilotResponse)
async def query_copilot_chat(
    query_in: CopilotQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await handle_copilot_query(query_in, current_user, db)

@router.post("/query", response_model=CopilotResponse)
async def query_copilot_query(
    query_in: CopilotQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await handle_copilot_query(query_in, current_user, db)
