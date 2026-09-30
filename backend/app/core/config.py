import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    APP_NAME: str = "FraudShield"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    SECRET_KEY: str = "demo_super_secret_key_change_in_production_32bytes_min"
    JWT_SECRET: str = "demo_jwt_secret_key_change_in_production_32bytes_min"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Database
    DATABASE_URL: str = "sqlite:///./fraudshield.db"
    USE_SQLITE: bool = True

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # Notification settings
    NOTIFICATION_PROVIDER: str = "mock"  # mock | ses | sns
    ALERT_EMAIL_RECIPIENT: str = "fraud-alerts@company.example.com"

    # AWS
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_SES_FROM_EMAIL: str = ""
    AWS_SNS_TOPIC_ARN: str = ""


settings = Settings()
