from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

@router.get("/ready")
def readiness_check():
    return {
        "ready": True,
        "service": settings.APP_NAME
    }
