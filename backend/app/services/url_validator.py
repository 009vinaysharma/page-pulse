"""
URLValidator: single responsibility is turning raw user input into a
safe, normalized URL — or rejecting it with a specific domain exception.

Kept separate from the fetching/parsing logic (WebAnalyzer) so each
class has exactly one reason to change: this one changes if validation
rules change, WebAnalyzer changes if parsing/fetching logic changes.
"""

import ipaddress
import socket
from urllib.parse import urlparse

from app.domain.exceptions import BlockedURLError, InvalidURLError

# Hostnames that always resolve to the local machine, blocked outright
# regardless of what DNS says.
_BLOCKED_HOSTNAMES = {"localhost", "localhost.localdomain", "0.0.0.0"}

_ALLOWED_SCHEMES = {"http", "https"}


class URLValidator:
    """Validates and normalizes user-submitted URLs before they're fetched."""

    def __init__(self, max_url_length: int = 2048):
        self.max_url_length = max_url_length

    def validate_and_normalize(self, raw_url: str) -> str:
        """
        Returns a normalized, safe-to-fetch URL, or raises:
          - InvalidURLError for malformed input
          - BlockedURLError for URLs targeting internal/private infrastructure
        """
        candidate = (raw_url or "").strip()

        if not candidate:
            raise InvalidURLError("Please enter a URL to analyze.")

        if len(candidate) > self.max_url_length:
            raise InvalidURLError(
                f"URL is too long (max {self.max_url_length} characters)."
            )

        parsed = urlparse(candidate)

        # Users often type "example.com" without a scheme — default to https.
        if not parsed.scheme:
            candidate = f"https://{candidate}"
            parsed = urlparse(candidate)

        if parsed.scheme not in _ALLOWED_SCHEMES:
            raise InvalidURLError("Only http:// and https:// URLs are supported.")

        hostname = parsed.hostname
        if not hostname:
            raise InvalidURLError(
                "That doesn't look like a valid URL. Try something like "
                "'example.com' or 'https://example.com'."
            )

        self._guard_against_internal_targets(hostname)

        return candidate

    def _guard_against_internal_targets(self, hostname: str) -> None:
        """
        Blocks requests aimed at loopback, private, link-local, or otherwise
        reserved addresses. Without this, the server could be tricked into
        making requests to internal infrastructure on its behalf (SSRF),
        e.g. cloud metadata services at 169.254.169.254.
        """
        lowered = hostname.lower()
        if lowered in _BLOCKED_HOSTNAMES:
            raise BlockedURLError(
                "Requests to local/internal hostnames are not allowed."
            )

        # If the hostname is itself a literal IP, check it directly.
        literal_ip = self._try_parse_ip(lowered)
        if literal_ip is not None:
            self._reject_if_unsafe(literal_ip)
            return

        # Otherwise resolve DNS and check every returned address. DNS
        # failures are NOT our concern here — they'll surface naturally
        # as a CONNECTION_ERROR when the actual request is attempted.
        try:
            resolved = socket.getaddrinfo(hostname, None)
        except socket.gaierror:
            return

        for info in resolved:
            ip_str = info[4][0]
            ip = self._try_parse_ip(ip_str)
            if ip is not None:
                self._reject_if_unsafe(ip)

    @staticmethod
    def _try_parse_ip(value: str):
        try:
            return ipaddress.ip_address(value)
        except ValueError:
            return None

    @staticmethod
    def _reject_if_unsafe(ip) -> None:
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        ):
            raise BlockedURLError(
                "That address points to a private or internal network and "
                "cannot be analyzed."
            )
