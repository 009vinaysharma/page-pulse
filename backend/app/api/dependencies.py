"""
Dependency providers. Centralizing construction here means routes stay
thin and services can be swapped out (e.g. in tests) without touching
route code — Dependency Inversion in practice.
"""

from functools import lru_cache

from app.core.config import Settings, get_settings
from app.services.url_validator import URLValidator
from app.services.web_analyzer import WebAnalyzer


@lru_cache
def get_url_validator() -> URLValidator:
    settings: Settings = get_settings()
    return URLValidator(max_url_length=settings.max_url_length)


@lru_cache
def get_web_analyzer() -> WebAnalyzer:
    settings: Settings = get_settings()
    return WebAnalyzer(settings=settings, url_validator=get_url_validator())
