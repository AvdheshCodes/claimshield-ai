import os
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("insureguard.database")

Base = declarative_base()

def create_engine_for_url(db_url: str):
    if "sqlite" in db_url:
        return create_async_engine(
            db_url,
            echo=False,
            connect_args={"check_same_thread": False}
        )
    return create_async_engine(
        db_url,
        echo=False,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

# Primary engine: default to sqlite for standalone local dev unless postgres is explicitly set in env
effective_url = settings.DATABASE_URL
# In local development if PostgreSQL is default url on localhost, check if we should fallback to sqlite
if "postgresql" in effective_url and os.getenv("FORCE_POSTGRES") != "true":
    # Default to sqlite for local dev reliability unless docker is active
    effective_url = "sqlite+aiosqlite:///./insureguard.db"

engine = create_engine_for_url(effective_url)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """
    Creates all database tables and seeds baseline system users if they don't exist.
    """
    from app.models import User, Policy, Claim, Document, FraudFinding, InvestigationCase, CaseNote, AuditLog
    from app.core.security import get_password_hash
    from sqlalchemy import select

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema verified / initialized.")

    # Seed baseline users for authentication and demo
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == "investigator@insureguard.ai"))
        if not result.scalar_one_or_none():
            demo_users = [
                User(
                    email="investigator@insureguard.ai",
                    hashed_password=get_password_hash("investigator123"),
                    full_name="Avdhesh Ghansela",
                    role="INVESTIGATOR",
                    phone_number="+91-98765-00001"
                ),
                User(
                    email="admin@insureguard.ai",
                    hashed_password=get_password_hash("admin123"),
                    full_name="Lead Administrator",
                    role="ADMIN"
                ),
                User(
                    email="customer@insureguard.ai",
                    hashed_password=get_password_hash("customer123"),
                    full_name="Priya Verma",
                    role="CUSTOMER",
                    phone_number="+91-98765-00001"
                )
            ]
            session.add_all(demo_users)
            await session.commit()
            logger.info("Baseline demo users seeded.")
