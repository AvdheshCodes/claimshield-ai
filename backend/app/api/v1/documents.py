import os
import hashlib
import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.claim import Claim
from app.models.document import Document
from app.services.document_forensics.forensics import DocumentForensicsService

router = APIRouter(prefix="/claims/{claim_id}/documents", tags=["Document Management & Forensics"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_document(
    claim_id: str,
    document_type: str = Form("supporting_document"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        c_uuid = uuid.UUID(claim_id)
        result = await db.execute(select(Claim).where(Claim.id == c_uuid))
    except (ValueError, TypeError):
        result = await db.execute(select(Claim).where(Claim.claim_number == claim_id))
    
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()

    claim_dir = os.path.join(settings.UPLOAD_DIR, str(claim.id))
    os.makedirs(claim_dir, exist_ok=True)
    file_path = os.path.join(claim_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # PyMuPDF OCR & structured entity extraction
    text_data = DocumentForensicsService.extract_text_and_fields(file_path)
    forensic_metadata = DocumentForensicsService.extract_metadata(file_path)
    has_tampering = len(forensic_metadata.get("suspicious_metadata_flags", [])) > 0

    doc = Document(
        id=uuid.uuid4(),
        claim_id=claim.id,
        uploaded_by=current_user.id,
        document_type=document_type.lower(),
        original_filename=file.filename,
        stored_path=file_path,
        file_size_bytes=len(content),
        mime_type=file.content_type or "application/octet-stream",
        sha256_hash=file_hash,
        ocr_status="COMPLETED",
        raw_extracted_text=text_data.get("raw_text", ""),
        extracted_metadata=text_data.get("extracted_metadata", {}),
        extraction_confidence=text_data.get("confidence", 0.95),
        has_tampering_indicators=has_tampering,
        forensic_details=forensic_metadata
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return {
        "id": str(doc.id),
        "claim_id": str(claim.id),
        "document_type": doc.document_type,
        "original_filename": doc.original_filename,
        "file_size_bytes": doc.file_size_bytes,
        "sha256_hash": doc.sha256_hash,
        "has_tampering_indicators": doc.has_tampering_indicators,
        "extracted_metadata": doc.extracted_metadata,
        "raw_extracted_text": doc.raw_extracted_text[:300] + "..." if len(doc.raw_extracted_text or "") > 300 else doc.raw_extracted_text
    }

@router.get("")
async def list_claim_documents(
    claim_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        c_uuid = uuid.UUID(claim_id)
        claim_res = await db.execute(select(Claim).where(Claim.id == c_uuid))
    except (ValueError, TypeError):
        claim_res = await db.execute(select(Claim).where(Claim.claim_number == claim_id))
    
    claim = claim_res.scalar_one_or_none()
    if not claim:
        return []

    result = await db.execute(select(Document).where(Document.claim_id == claim.id))
    docs = result.scalars().all()

    return [
        {
            "id": str(d.id),
            "claim_id": str(d.claim_id),
            "document_type": d.document_type,
            "original_filename": d.original_filename,
            "file_size_bytes": d.file_size_bytes,
            "mime_type": d.mime_type,
            "sha256_hash": d.sha256_hash,
            "ocr_status": d.ocr_status,
            "has_tampering_indicators": d.has_tampering_indicators,
            "raw_extracted_text": d.raw_extracted_text,
            "extracted_metadata": d.extracted_metadata or {},
            "forensic_details": d.forensic_details or {},
            "file_url": f"/uploads/{claim.id}/{d.original_filename}",
            "created_at": d.created_at.isoformat() if d.created_at else None
        }
        for d in docs
    ]
