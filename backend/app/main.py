"""
Page Pulse — FastAPI backend entry point.

Uses an application-factory pattern (`create_app`) so the app can be
constructed fresh in tests without relying on module-level side effects.

Exposes:
  GET  /                 -> service banner
  GET  /api/health        -> health check (Render / uptime pings)
  POST /api/analyze       -> runs the website audit and returns JSON

Built for the Digital Heroes Software Development Internship.
"""

import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.core.config import get_settings
from app.core.logging_config import configure_logging
from app.domain.exceptions import PagePulseError
from app.domain.schemas import ErrorResponse

configure_logging()
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description=(
            "A lightweight website auditing API — checks health, SEO "
            "basics, and structure of any public webpage."
        ),
        version=settings.app_version,
        # Hide interactive docs in production if desired; left on here
        # since this is a portfolio/training project.
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
    )

    _register_middleware(app)
    _register_exception_handlers(app)

    app.include_router(router, prefix="/api")

    @app.get("/", tags=["Health"])
    def root():
        """Root endpoint so visiting the API URL directly shows something useful."""
        return {"service": settings.app_name, "version": settings.app_version, "status": "running"}

    logger.info(
        "Page Pulse API starting | env=%s | allowed_origins=%s",
        settings.environment,
        settings.allowed_origins,
    )
    return app


def _register_middleware(app: FastAPI) -> None:
    @app.middleware("http")
    async def add_request_context(request: Request, call_next):
        """
        Tags every request with a short-lived ID and logs its total
        duration — invaluable for tracing a single audit through logs
        without needing a full APM setup.
        """
        request_id = uuid.uuid4().hex[:8]
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = int((time.perf_counter() - start) * 1000)
        response.headers["X-Request-ID"] = request_id
        logger.debug(
            "[%s] %s %s -> %s (%sms)",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response


def _register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(PagePulseError)
    async def handle_page_pulse_error(request: Request, exc: PagePulseError):
        """
        Every expected failure mode (bad URL, blocked/internal address,
        timeout, SSL error, connection failure, redirect loop) surfaces
        here with the correct, specific HTTP status code — instead of
        collapsing everything to a generic 200 or 500.
        """
        logger.warning("%s: %s", exc.error_type, exc.message)
        body = ErrorResponse(error_type=exc.error_type, message=exc.message)
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError):
        """
        Normalizes FastAPI/Pydantic's default validation error shape into
        our own ErrorResponse contract, so the frontend only ever has to
        handle one error shape regardless of where in the stack a request
        was rejected.
        """
        first_error = exc.errors()[0] if exc.errors() else {}
        raw_message = first_error.get("msg", "Invalid request.")
        # Pydantic prefixes custom validator messages with "Value error, " —
        # strip that for a cleaner, user-facing message.
        message = raw_message.removeprefix("Value error, ")
        logger.warning("VALIDATION_ERROR: %s", message)
        body = ErrorResponse(error_type="INVALID_URL", message=message)
        return JSONResponse(status_code=422, content=body.model_dump())

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception):
        """
        Last-resort safety net. No matter what happens elsewhere in the
        app, the API must never return a raw stack trace or crash the
        process — the client always gets a valid, structured JSON body.
        """
        logger.exception("Unhandled exception while processing request")
        body = ErrorResponse(
            error_type="SERVER_ERROR",
            message="An unexpected server error occurred. Please try again.",
        )
        return JSONResponse(status_code=500, content=body.model_dump())


app = create_app()
