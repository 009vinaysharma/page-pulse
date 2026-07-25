"""
Logging setup. Kept separate from main.py so the format/level policy is
defined in exactly one place and can be reused by any module via
`logging.getLogger(__name__)`.
"""

import logging
import sys

from app.core.config import get_settings


def configure_logging() -> None:
    """
    Configures the root logger once at startup. Uses a compact,
    grep-friendly format:
        2026-07-24 10:15:03 | INFO | app.api.routes | Analyzed https://example.com in 184ms
    """
    settings = get_settings()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(settings.log_level.upper())

    # Quiet down noisy third-party loggers unless we're debugging.
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
