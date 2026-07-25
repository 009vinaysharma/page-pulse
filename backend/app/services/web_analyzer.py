"""
WebAnalyzer: single responsibility is fetching a URL (safely, following
redirects manually so each hop can be re-validated against SSRF rules)
and extracting the metrics Page Pulse reports.

Raises typed `PagePulseError` subclasses on failure — it never returns
an ad-hoc error dict, and it never lets a raw `requests`/`bs4` exception
escape. The API layer is the only place that turns exceptions into
HTTP responses.
"""

import logging
import time
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from app.core.config import Settings
from app.domain.exceptions import (
    BlockedURLError,
    ConnectionFailedError,
    InvalidURLError,
    RequestTimeoutError,
    SSLVerificationError,
    TooManyRedirectsError,
    UpstreamRequestError,
)
from app.domain.schemas import AnalyzeResponse
from app.services.url_validator import URLValidator

logger = logging.getLogger(__name__)

MAX_REDIRECT_HOPS = 5

# Tags whose text content should not count toward the word count /
# should be stripped before text extraction (non-visible or non-prose).
_NON_CONTENT_TAGS = ("script", "style", "noscript", "template")


class WebAnalyzer:
    """Fetches a URL and extracts Page Pulse's audit metrics from it."""

    def __init__(self, settings: Settings, url_validator: URLValidator):
        self._settings = settings
        self._validator = url_validator
        # A shared session reuses TCP connections across requests, which
        # matters here since a single audit may involve several redirect hops.
        self._session = requests.Session()

    def analyze(self, raw_url: str) -> AnalyzeResponse:
        """Runs a full audit of `raw_url` and returns a populated AnalyzeResponse."""
        start_url = self._validator.validate_and_normalize(raw_url)

        start = time.perf_counter()
        response, body, final_url, was_redirected = self._fetch_with_guarded_redirects(
            start_url
        )
        elapsed_ms = int((time.perf_counter() - start) * 1000)

        content_type = response.headers.get("Content-Type", "")

        if "text/html" not in content_type.lower():
            return AnalyzeResponse(
                requested_url=raw_url,
                final_url=final_url,
                http_status=response.status_code,
                response_time_ms=elapsed_ms,
                title=None,
                meta_description=(
                    f"Non-HTML content detected ({content_type or 'unknown type'}). "
                    "Page content analysis skipped."
                ),
                content_type=content_type or "unknown",
                was_redirected=was_redirected,
            )

        metrics = self._parse_html(body, response.encoding)

        return AnalyzeResponse(
            requested_url=raw_url,
            final_url=final_url,
            http_status=response.status_code,
            response_time_ms=elapsed_ms,
            content_type=content_type,
            was_redirected=was_redirected,
            **metrics,
        )

    # -- Fetching -----------------------------------------------------------

    def _fetch_with_guarded_redirects(self, url: str):
        """
        Follows redirects one hop at a time (instead of letting `requests`
        auto-follow them) so every hop can be re-validated against the
        same SSRF rules as the original URL. A malicious site can't use a
        redirect to smuggle a request to an internal address past our checks.
        """
        current_url = url
        original_url = url

        for _ in range(MAX_REDIRECT_HOPS + 1):
            response, chunk_iter = self._send_request(current_url)

            if response.is_redirect and "Location" in response.headers:
                next_url = urljoin(current_url, response.headers["Location"])
                response.close()
                try:
                    current_url = self._validator.validate_and_normalize(next_url)
                except (InvalidURLError, BlockedURLError) as exc:
                    raise BlockedURLError(
                        "This URL redirects to an address that cannot be analyzed."
                    ) from exc
                continue

            body = self._read_capped_body(chunk_iter)
            response.close()
            was_redirected = current_url != original_url
            return response, body, current_url, was_redirected

        raise TooManyRedirectsError(
            "The URL resulted in a redirect loop and could not be resolved."
        )

    def _send_request(self, url: str):
        try:
            response = self._session.get(
                url,
                timeout=self._settings.request_timeout_seconds,
                allow_redirects=False,
                headers={"User-Agent": self._settings.user_agent},
                stream=True,
            )
            return response, response.iter_content(chunk_size=8192)
        except requests.exceptions.SSLError as exc:
            raise SSLVerificationError(
                "The site's SSL certificate could not be verified. The "
                "connection is not secure or the certificate is invalid/expired."
            ) from exc
        except requests.exceptions.Timeout as exc:
            raise RequestTimeoutError(
                f"The site took too long to respond (over "
                f"{int(self._settings.request_timeout_seconds)}s). It may be "
                "down or overloaded."
            ) from exc
        except requests.exceptions.ConnectionError as exc:
            raise ConnectionFailedError(
                "Could not connect to that URL. Check the address and make "
                "sure the site is online."
            ) from exc
        except requests.exceptions.TooManyRedirects as exc:
            raise TooManyRedirectsError(
                "The URL resulted in a redirect loop and could not be resolved."
            ) from exc
        except requests.exceptions.RequestException as exc:
            raise UpstreamRequestError(f"Request failed: {exc}") from exc

    def _read_capped_body(self, chunk_iter) -> bytes:
        """Reads the response body up to `max_response_bytes` to bound memory/time."""
        content = bytearray()
        try:
            for chunk in chunk_iter:
                content.extend(chunk)
                if len(content) >= self._settings.max_response_bytes:
                    break
        except requests.exceptions.RequestException:
            # Body streaming failed partway — we still have headers/status,
            # so proceed with whatever was read instead of failing the audit.
            logger.warning("Response body streaming interrupted; using partial content.")
        return bytes(content)

    # -- Parsing --------------------------------------------------------------

    def _parse_html(self, content_bytes: bytes, declared_encoding: str | None) -> dict:
        """
        Extracts title, meta description, heading/image stats, and an
        approximate word count from raw HTML bytes.

        Uses lxml's parser (via BeautifulSoup) when available — it's
        substantially faster than the pure-Python html.parser on large
        pages — and transparently falls back if lxml isn't installed.
        """
        html = self._decode(content_bytes, declared_encoding)
        soup = self._build_soup(html)

        title_tag = soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else None

        meta_description = self._extract_meta_description(soup)

        h1_count = len(soup.find_all("h1"))

        images = soup.find_all("img")
        image_count = len(images)
        images_missing_alt = sum(
            1 for img in images if not (img.get("alt") or "").strip()
        )

        word_count = self._count_words(soup)

        return {
            "title": title,
            "meta_description": meta_description,
            "h1_count": h1_count,
            "image_count": image_count,
            "images_missing_alt": images_missing_alt,
            "word_count": word_count,
        }

    @staticmethod
    def _decode(content_bytes: bytes, declared_encoding: str | None) -> str:
        try:
            return content_bytes.decode(declared_encoding or "utf-8", errors="replace")
        except (LookupError, TypeError):
            return content_bytes.decode("utf-8", errors="replace")

    @staticmethod
    def _build_soup(html: str) -> BeautifulSoup:
        try:
            return BeautifulSoup(html, "lxml")
        except Exception:  # lxml not installed / failed to parse
            return BeautifulSoup(html, "html.parser")

    @staticmethod
    def _extract_meta_description(soup: BeautifulSoup) -> str | None:
        meta_tag = soup.find("meta", attrs={"name": "description"})
        if meta_tag and meta_tag.get("content"):
            return meta_tag["content"].strip()

        og_desc = soup.find("meta", attrs={"property": "og:description"})
        if og_desc and og_desc.get("content"):
            return og_desc["content"].strip()

        return None

    @staticmethod
    def _count_words(soup: BeautifulSoup) -> int:
        for tag in soup(_NON_CONTENT_TAGS):
            tag.decompose()
        text = soup.get_text(separator=" ")
        return len([w for w in text.split() if w.strip()])
