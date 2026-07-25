"""
Domain exceptions for the audit workflow.

Each exception carries:
  - error_type: a stable machine-readable code the frontend can switch on
  - message:    a human-readable explanation safe to show to the end user
  - status_code: the HTTP status FastAPI should respond with

Keeping this mapping on the exception itself (rather than scattered
if/elif blocks in the route) means adding a new failure mode never
requires touching the API layer — a core SOLID "open for extension,
closed for modification" win.
"""


class PagePulseError(Exception):
    """Base class for all handled, expected audit failures."""

    error_type: str = "UNKNOWN_ERROR"
    status_code: int = 500

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class InvalidURLError(PagePulseError):
    """The submitted URL is malformed, empty, or uses an unsupported scheme."""

    error_type = "INVALID_URL"
    status_code = 400


class BlockedURLError(PagePulseError):
    """
    The URL resolves to a private/internal/loopback address. Refusing
    these requests prevents the server from being used as an SSRF proxy
    to reach internal infrastructure (e.g. cloud metadata endpoints).
    """

    error_type = "BLOCKED_URL"
    status_code = 400


class RequestTimeoutError(PagePulseError):
    """The target site did not respond within the configured timeout."""

    error_type = "TIMEOUT"
    status_code = 408


class SSLVerificationError(PagePulseError):
    """The target site's TLS certificate could not be verified."""

    error_type = "SSL_ERROR"
    status_code = 502


class ConnectionFailedError(PagePulseError):
    """DNS resolution or the TCP connection to the target site failed."""

    error_type = "CONNECTION_ERROR"
    status_code = 502


class TooManyRedirectsError(PagePulseError):
    """The target URL is stuck in a redirect loop."""

    error_type = "TOO_MANY_REDIRECTS"
    status_code = 502


class UpstreamRequestError(PagePulseError):
    """A generic, non-specific failure while talking to the target site."""

    error_type = "REQUEST_FAILED"
    status_code = 502
