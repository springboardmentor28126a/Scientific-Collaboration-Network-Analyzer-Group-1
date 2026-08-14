import json
import re
from pathlib import Path

from backend.database.models import Publication


class PublicationContentUnavailable(Exception):
    """Raised when a publication has no usable abstract or PDF text."""


def _local_pdf_path(pdf_file: str | None) -> Path | None:
    if not pdf_file or pdf_file.startswith("http"):
        return None
    relative = pdf_file.lstrip("/").replace("/", "/")
    candidate = Path(relative)
    if not candidate.is_absolute():
        candidate = Path.cwd() / candidate
    return candidate.resolve()


def extract_publication_text(publication: Publication, max_chars: int = 24000) -> str | None:
    sections = []
    if publication.abstract and publication.abstract.strip():
        sections.append(f"Abstract:\n{publication.abstract.strip()}")

    pdf_path = _local_pdf_path(publication.pdf_file)
    if pdf_path and pdf_path.is_file():
        try:
            from pypdf import PdfReader
            pdf_text = "\n".join(page.extract_text() or "" for page in PdfReader(str(pdf_path)).pages).strip()
            if pdf_text:
                sections.append(f"PDF text:\n{pdf_text}")
        except Exception:
            # A malformed/unreadable PDF must not break the publication page.
            pass

    content = "\n\n".join(sections).strip()
    return content[:max_chars] if content else None


def publication_context(publication: Publication, content: str) -> dict:
    return {
        "publication": {
            "title": publication.title,
            "authors": publication.authors,
            "journal": publication.journal or "",
            "publication_year": publication.publication_year,
            "keywords": publication.keywords or "",
            "abstract": publication.abstract or "",
        },
        "publication_content": content,
    }


def parse_analysis(raw: str) -> dict:
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE)
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except (TypeError, json.JSONDecodeError):
        pass
    return {"summary": raw.strip()}
