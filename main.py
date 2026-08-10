"""Repository-root ASGI entry point.

This keeps the documented ``uvicorn main:app --reload`` command working from
the repository root while the application remains organized under ``backend``.
"""

from backend.main import app

__all__ = ["app"]
