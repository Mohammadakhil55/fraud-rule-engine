from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.errors import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.database.session import init_db
from app.api.routes.health import router as health_router
from app.api.routes.evaluation import router as evaluation_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} in [{settings.ENVIRONMENT}] mode")
    init_db()
    yield
    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    description="FraudShield: AI-Ready Fraud Rule Engine & Transaction Review Console. 'Detect. Investigate. Decide.'",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Include Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(evaluation_router, prefix=settings.API_V1_STR)

@app.get("/")
def root_info():
    return {
        "title": settings.APP_NAME,
        "subtitle": "Detect. Investigate. Decide.",
        "version": "1.0.0",
        "docs_url": "/docs",
        "status": "online"
    }
