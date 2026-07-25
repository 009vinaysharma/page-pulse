"""
API request/response schemas. Validation lives here at the edge of the
system so malformed input is rejected before it ever reaches business
logic (fail fast).
"""

from typing import Optional

from pydantic import BaseModel, Field, field_validator


class AnalyzeRequest(BaseModel):
    """Incoming payload from the frontend when a user submits a URL."""

    url: str = Field(
        ...,
        min_length=1,
        max_length=2048,
        description="The URL the user wants to audit",
        examples=["example.com"],
    )

    @field_validator("url")
    @classmethod
    def strip_and_check_not_blank(cls, value: str) -> str:
        """Basic sanitation: trim whitespace, reject blank/whitespace-only input."""
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("URL must not be empty.")
        # Reject embedded control/newline characters outright (header/URL injection defense)
        if any(ord(ch) < 32 for ch in cleaned):
            raise ValueError("URL contains invalid control characters.")
        return cleaned


class AnalyzeResponse(BaseModel):
    """Successful audit result returned to the frontend."""

    success: bool = True
    requested_url: str
    final_url: str
    http_status: int
    response_time_ms: int
    title: Optional[str] = None
    meta_description: Optional[str] = None
    h1_count: int = 0
    image_count: int = 0
    images_missing_alt: int = 0
    word_count: int = 0
    content_type: Optional[str] = None
    was_redirected: bool = False


class ErrorResponse(BaseModel):
    """
    Uniform error shape. Every failure mode (bad URL, timeout, SSL error,
    blocked/internal address, non-HTML content, etc.) is normalized into
    this shape so the frontend never has to guess what fields exist.
    """

    success: bool = False
    error_type: str
    message: str


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str
    version: str
