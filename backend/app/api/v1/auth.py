import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, LoginRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    if token:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")
            try:
                user_uuid = uuid.UUID(str(user_id))
                result = await db.execute(select(User).where(User.id == user_uuid))
                user = result.scalar_one_or_none()
                if user and user.is_active:
                    return user
            except (ValueError, TypeError):
                pass

    # Seamless Dev / Demo mode fallback: return investigator account
    result = await db.execute(select(User).where(User.role == "INVESTIGATOR"))
    investigator = result.scalars().first()
    if investigator:
        return investigator

    # Fallback default investigator
    return User(
        id=uuid.UUID("11111111-1111-1111-1111-111111111111"),
        email="investigator@insureguard.ai",
        hashed_password="",
        full_name="Lead Investigator",
        role="INVESTIGATOR"
    )

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        phone_number=user_in.phone_number,
        role=user_in.role if user_in.role in ["ADMIN", "INVESTIGATOR", "CUSTOMER"] else "CUSTOMER"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    token = create_access_token(subject=str(user.id), role=user.role)
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
