"""
API routes. Thin by design: validate input (via Pydantic + services),
delegate to the WebAnalyzer, and let the global exception handlers in
main.py translate domain exceptions into HTTP responses. No business
logic lives here.
"""

import logging

from fastapi import APIRouter, Depends

from app.api.dependencies import get_web_analyzer
from app.core.config import get_settings
from app.domain.schemas import AnalyzeRequest, AnalyzeResponse, HealthResponse
from app.services.web_analyzer import WebAnalyzer

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check() -> HealthResponse:
    """Lightweight health check used for uptime monitoring / Render."""
    settings = get_settings()
    return HealthResponse(service=settings.app_name, version=settings.app_version)


@router.post("/analyze", response_model=AnalyzeResponse, tags=["Audit"])
def analyze(
    payload: AnalyzeRequest,
    analyzer: WebAnalyzer = Depends(get_web_analyzer),
) -> AnalyzeResponse:
    """
    Runs a full audit of the submitted URL.

    Validation errors and expected upstream failures (timeouts, SSL
    errors, connection failures, etc.) are raised as typed
    `PagePulseError` subclasses and handled centrally in main.py, which
    maps each one to its correct HTTP status code.
    """
    result = analyzer.analyze(payload.url)
    logger.info(
        "Analyzed %s -> %s in %sms (status=%s)",
        payload.url,
        result.final_url,
        result.response_time_ms,
        result.http_status,
    )
    return result
