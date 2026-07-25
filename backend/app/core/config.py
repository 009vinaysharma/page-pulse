"""
Centralized configuration. All tunable values live here instead of being
scattered across modules, so behavior can be changed via environment
variables without touching code (12-factor app style) — important for
deploying the same image to Render with different env vars.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- App metadata ---
    app_name: str = "Page Pulse API"
    app_version: str = "2.0.0"
    environment: str = "development"  # "development" | "production"

    # --- CORS ---
    # Comma-separated list of allowed origins, e.g.
    # "https://page-pulse.vercel.app,https://www.page-pulse.app"
    allowed_origins_raw: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- Networking / audit engine ---
    request_timeout_seconds: float = 10.0
    max_response_bytes: int = 5 * 1024 * 1024  # 5 MB cap on downloaded body
    max_url_length: int = 2048
    user_agent: str = (
        "Mozilla/5.0 (compatible; PagePulseBot/2.0; "
        "+https://digitalheroesco.com) PagePulse-Auditor"
    )

    # --- Logging ---
    log_level: str = "INFO"

    @property
    def allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins_raw.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor — avoids re-parsing env vars on every call."""
    return Settings()
