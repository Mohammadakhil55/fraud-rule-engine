import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings
from app.core.logging import logger

database_url = settings.DATABASE_URL

# SQLite configuration needs check_same_thread=False
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables if they do not exist."""
    import app.database.models  # Ensure models are registered with Base.metadata
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
