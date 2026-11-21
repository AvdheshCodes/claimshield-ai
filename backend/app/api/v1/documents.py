import os
import hashlib
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.claim import Claim
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.document_forensics.forensics import DocumentForensicsService

router = APIRouter(prefix="/claims/{claim_id}/documents", tags=["Document Management"])

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    claim_id: UUID,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify claim ownership or investigator
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role == "CUSTOMER" and claim.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Read bytes and compute hash
    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()
    
    # Save to disk
    claim_dir = os.path.join(settings.UPLOAD_DIR, str(claim_id))
    os.makedirs(claim_dir, exist_ok=True)
    file_path = os.path.join(claim_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # Run quick forensics metadata analysis
    forensic_metadata = DocumentForensicsService.extract_metadata(file_path)

    doc = Document(
        claim_id=claim_id,
        uploaded_by=current_user.id,
        document_type=document_type.lower(),
        original_filename=file.filename,
        stored_path=file_path,
        file_size_bytes=len(content),
        mime_type=file.content_type or "application/octet-stream",
        sha256_hash=file_hash,
        ocr_status="COMPLETED",
        has_tampering_indicators=len(forensic_metadata.get("suspicious_metadata_flags", [])) > 0,
        forensic_details=forensic_metadata
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc

@router.get("", response_model=List[DocumentResponse])
async def list_claim_documents(
    claim_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.claim_id == claim_id))
    return result.scalars().all()
