import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.neo4j_client import neo4j_client
from app.core.database import init_db
from app.api.v1 import api_router

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print(f"🛡️  Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    try:
        await init_db()
    except Exception as e:
        print(f"⚠️  Database initialization note: {e}")

    try:
        await neo4j_client.connect()
    except Exception as e:
        print(f"⚠️  Neo4j startup note: {e}")
    yield
    # Shutdown actions
    await neo4j_client.close()
    print("🛡️  InsureGuard AI Backend stopped.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Insurance Fraud Detection & Explainable Investigation Platform",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API v1 Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": "development"
    }

@app.get(f"{settings.API_V1_STR}/info")
async def platform_info():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "modules": [
            "Claim Management",
            "OCR & Document Intelligence",
            "Document Tampering Forensics",
            "Explainable Fraud Engine (WHY SUSPICIOUS?)",
            "Fraud Relationship Graph",
            "AI Investigation Copilot (RAG)",
            "Customer Transparency Portal",
            "Investigation Case Management",
            "Privacy & PII Protection"
        ]
    }
