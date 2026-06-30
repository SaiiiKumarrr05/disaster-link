"""
Application configuration, loaded from environment variables.
In production these map to Supabase project settings (DB URL, JWT secret, etc).
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "DisasterLink AI API"
    environment: str = "development"

    # Supabase / Postgres connection (production target)
    database_url: str = "postgresql://postgres:postgres@localhost:5432/disasterlink"

    # Auth
    jwt_secret: str = "CHANGE_ME_IN_PRODUCTION"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24h, appropriate for field use without re-login

    # CORS
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # SOS behaviour
    sos_critical_response_minutes: int = 10  # SLA used to flag overdue cases in the rescue dashboard

    class Config:
        env_file = ".env"


settings = Settings()
