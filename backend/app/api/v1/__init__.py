from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.claims import router as claims_router
from app.api.v1.documents import router as documents_router
from app.api.v1.fraud import router as fraud_router
from app.api.v1.graph import router as graph_router
from app.api.v1.copilot import router as copilot_router
from app.api.v1.customer import router as customer_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(claims_router)
api_router.include_router(documents_router)
api_router.include_router(fraud_router)
api_router.include_router(graph_router)
api_router.include_router(copilot_router)
api_router.include_router(customer_router)
