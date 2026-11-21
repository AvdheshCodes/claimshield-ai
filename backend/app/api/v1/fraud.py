from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.claim import Claim
from app.models.document import Document
from app.models.finding import FraudFinding
from app.schemas.finding import FindingResponse, FindingFeedbackUpdate
from app.services.fraud_detection.engine import ExplainableFraudEngine

router = APIRouter(prefix="/claims/{claim_id}", tags=["Fraud Intelligence (WHY SUSPICIOUS?)"])

@router.post("/analyze")
async def analyze_claim(
    claim_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "INVESTIGATOR"]:
        raise HTTPException(status_code=403, detail="Restricted to fraud investigators")

    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    docs_res = await db.execute(select(Document).where(Document.claim_id == claim_id))
    docs = docs_res.scalars().all()

    # Synthetic duplicate check
    historical_duplicates = {"recycled_invoices": []}
    for d in docs:
        if d.document_type == "repair_invoice":
            inv_no = (d.extracted_metadata or {}).get("invoiceNumber", "")
            if "999" in inv_no:
                historical_duplicates["recycled_invoices"].append({
                    "invoice_number": inv_no,
                    "matched_claim": "CS-2024-0004",
                    "doc_id": d.id
                })

    claim_dict = {
        "vehicle_registration": claim.vehicle_registration,
        "incident_date": claim.incident_date,
        "claimed_amount": claim.claimed_amount
    }
    extracted_docs = [
        {
            "id": d.id,
            "document_type": d.document_type,
            "original_filename": d.original_filename,
            "extracted_metadata": d.extracted_metadata or {},
            "has_tampering_indicators": d.has_tampering_indicators
        }
        for d in docs
    ]

    score, band, findings = ExplainableFraudEngine.evaluate(claim_dict, extracted_docs, historical_duplicates)

    # Persist findings
    await db.execute(delete(FraudFinding).where(FraudFinding.claim_id == claim_id))
    for f in findings:
        db.add(FraudFinding(
            claim_id=claim_id,
            rule_id=f["rule_id"],
            rule_name=f["rule_name"],
            severity=f["severity"],
            points=f["points"],
            observation=f["observation"],
            evidence_document_id=f.get("evidence_document_id"),
            evidence_page_number=f.get("evidence_page_number", 1),
            evidence_snippet=f.get("evidence_snippet"),
            potential_alternative_explanation=f.get("potential_alternative_explanation"),
            recommended_action=f.get("recommended_action")
        ))

    claim.risk_score = score
    claim.risk_band = band
    claim.status = "UNDER_INVESTIGATION" if score >= 60 else "HUMAN_REVIEW"
    await db.commit()

    return {
        "claim_id": claim_id,
        "risk_score": score,
        "risk_band": band,
        "findings_count": len(findings)
    }

@router.get("/findings", response_model=List[FindingResponse])
async def get_claim_findings(
    claim_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "INVESTIGATOR"]:
        raise HTTPException(status_code=403, detail="Restricted")
    result = await db.execute(select(FraudFinding).where(FraudFinding.claim_id == claim_id))
    return result.scalars().all()
