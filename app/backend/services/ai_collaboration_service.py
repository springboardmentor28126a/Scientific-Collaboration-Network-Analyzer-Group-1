"""
AI Collaboration Recommender - Service Layer
=============================================

Computes an "AI-assisted collaboration compatibility score" between a
selected researcher and every other researcher in the database, using
ONLY data that actually exists in the SCNA database (research interests,
skills, publications, conference participation, institution/department,
and existing collaboration/citation records).

This module never invents researchers, publications, skills, institutions,
conferences, research interests, or collaborations. Where a field is
missing for a researcher, that component of the score simply contributes
0 for that pair -- it is never guessed or fabricated.

The compatibility score is a deterministic, weighted similarity score.
It is explicitly an AI-assisted collaboration compatibility score, not a
scientifically validated metric.

An LLM (Anthropic API) is used only to phrase a short, professional
explanation of a match, grounded strictly in the structured facts that
were retrieved from the database. If the LLM is unavailable, misconfigured,
or errors out for any reason, a rule-based explanation is generated
instead so the feature never breaks the page.
"""

import json
import logging
import os
import re

import httpx
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.backend.models.citation import Citation
from app.backend.models.collaboration import Collaboration, PublicationAuthor
from app.backend.models.conference import ConferenceParticipation
from app.backend.models.publication import Publication
from app.backend.models.researcher import Researcher

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Scoring weights (sum to 1.0 == 100%)
#
#   Research Interest Similarity      35%
#   Skills Similarity                 20%
#   Publication Topic Similarity      20%
#   Conference / Research Area Match  10%
#   Institution / Department Relevance 5%
#   Network / Citation Relationship   10%
# ---------------------------------------------------------------------------
WEIGHTS = {
    "research_interest": 0.35,
    "skills": 0.20,
    "publication_topics": 0.20,
    "conference_area": 0.10,
    "institution_department": 0.05,
    "network_citation": 0.10,
}

DEFAULT_RECOMMENDATION_LIMIT = 5

# Small, generic stopword list used only to keep publication-topic word
# overlap meaningful (removing "the", "and", etc.). This never filters out
# domain terms and never adds any topic that wasn't literally in the text.
_STOPWORDS = {
    "the", "and", "for", "with", "from", "that", "this", "are", "was",
    "were", "have", "has", "had", "using", "use", "used", "based", "into",
    "their", "its", "our", "these", "those", "can", "may", "also", "not",
    "but", "than", "then", "over", "under", "between", "among", "such",
    "via", "per", "new", "study", "approach", "paper", "results", "shows",
    "propose", "proposed", "abstract", "research", "analysis", "method",
    "methods", "model", "models", "data", "system", "systems", "work",
}


# ---------------------------------------------------------------------------
# Text / set helpers -- everything here operates only on strings that were
# already retrieved from the database (Researcher.research_interest,
# Researcher.skills, Publication.title, Publication.abstract, etc.)
# ---------------------------------------------------------------------------

def _split_terms(value):
    """Split a comma/semicolon/slash separated DB field into a lowercase
    term set. Returns an empty set for missing/blank data -- never guesses."""
    if not value:
        return set()
    parts = re.split(r"[,;/|]+", str(value))
    return {p.strip().lower() for p in parts if p.strip()}


def _tokenize(text):
    """Lowercase word-bag of a piece of DB text (title/abstract), stripped
    of short/common words. Empty/missing text yields an empty set."""
    if not text:
        return set()
    words = re.findall(r"[a-zA-Z][a-zA-Z\-]{2,}", str(text).lower())
    return {w for w in words if w not in _STOPWORDS}


def _jaccard(set_a, set_b):
    """Similarity in [0, 1]. If either side has no data, similarity is 0 --
    this is treated as "cannot be determined as similar", not invented."""
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union else 0.0


def _display_terms(term_set, limit=None):
    values = sorted({t.title() for t in term_set if t})
    return values[:limit] if limit else values


# ---------------------------------------------------------------------------
# Database lookups
# ---------------------------------------------------------------------------

def _researcher_publications(db: Session, researcher_id: int):
    """All publications where the researcher is the primary owner OR a
    listed co-author (via publication_authors), retrieved from the DB."""
    primary_ids = {
        row[0]
        for row in db.query(Publication.id)
        .filter(Publication.researcher_id == researcher_id)
        .all()
    }
    coauthor_ids = {
        row[0]
        for row in db.query(PublicationAuthor.publication_id)
        .filter(PublicationAuthor.researcher_id == researcher_id)
        .all()
    }
    all_ids = primary_ids | coauthor_ids
    if not all_ids:
        return []
    return db.query(Publication).filter(Publication.id.in_(all_ids)).all()


def _publication_topic_terms(publications):
    terms = set()
    for pub in publications:
        terms |= _tokenize(pub.title)
        terms |= _tokenize(pub.abstract)
    return terms


def _conference_ids(db: Session, researcher_id: int):
    rows = (
        db.query(ConferenceParticipation.conference_id)
        .filter(ConferenceParticipation.researcher_id == researcher_id)
        .all()
    )
    return {row[0] for row in rows}


def _has_direct_collaboration(db: Session, researcher_a_id, researcher_b_id):
    return (
        db.query(Collaboration)
        .filter(
            or_(
                and_(
                    Collaboration.primary_researcher_id == researcher_a_id,
                    Collaboration.partner_researcher_id == researcher_b_id,
                ),
                and_(
                    Collaboration.primary_researcher_id == researcher_b_id,
                    Collaboration.partner_researcher_id == researcher_a_id,
                ),
            )
        )
        .first()
        is not None
    )


def _has_citation_link(db: Session, pub_ids_a, pub_ids_b):
    if not pub_ids_a or not pub_ids_b:
        return False
    a_cites_b = (
        db.query(Citation)
        .filter(
            Citation.publication_id.in_(pub_ids_a),
            Citation.cited_publication_id.in_(pub_ids_b),
        )
        .first()
    )
    if a_cites_b:
        return True
    b_cites_a = (
        db.query(Citation)
        .filter(
            Citation.publication_id.in_(pub_ids_b),
            Citation.cited_publication_id.in_(pub_ids_a),
        )
        .first()
    )
    return b_cites_a is not None


def _researcher_summary(researcher: Researcher):
    return {
        "id": researcher.id,
        "full_name": researcher.full_name,
        "institution": researcher.institution,
        "department": researcher.department,
        "research_interest": researcher.research_interest,
        "skills": researcher.skills,
    }


# ---------------------------------------------------------------------------
# Core scoring
# ---------------------------------------------------------------------------

def _score_pair(db: Session, target, target_ctx, candidate):
    """Compute the weighted compatibility score between the target
    researcher and one candidate, using only retrieved DB data."""

    cand_interests = _split_terms(candidate.research_interest)
    cand_skills = _split_terms(candidate.skills)
    cand_pubs = _researcher_publications(db, candidate.id)
    cand_pub_ids = {p.id for p in cand_pubs}
    cand_terms = _publication_topic_terms(cand_pubs)
    cand_conferences = _conference_ids(db, candidate.id)

    interest_score = _jaccard(target_ctx["interests"], cand_interests)
    skills_score = _jaccard(target_ctx["skills"], cand_skills)
    topic_score = _jaccard(target_ctx["terms"], cand_terms)
    conference_score = _jaccard(target_ctx["conferences"], cand_conferences)

    # Institution / Department relevance: same institution scores highest,
    # same department (different institution) scores partial credit.
    inst_dept_score = 0.0
    if (
        target.institution
        and candidate.institution
        and target.institution.strip().lower() == candidate.institution.strip().lower()
    ):
        inst_dept_score = 1.0
    elif (
        target.department
        and candidate.department
        and target.department.strip().lower() == candidate.department.strip().lower()
    ):
        inst_dept_score = 0.5

    # Network / Citation relationship: existing co-authorship or logged
    # collaboration scores highest; a citation link between their
    # publications scores a partial signal.
    network_score = 0.0
    shares_publication = bool(target_ctx["pub_ids"] & cand_pub_ids)
    has_logged_collaboration = _has_direct_collaboration(db, target.id, candidate.id)
    if shares_publication or has_logged_collaboration:
        network_score = 1.0
    elif _has_citation_link(db, target_ctx["pub_ids"], cand_pub_ids):
        network_score = 0.6

    weighted = (
        WEIGHTS["research_interest"] * interest_score
        + WEIGHTS["skills"] * skills_score
        + WEIGHTS["publication_topics"] * topic_score
        + WEIGHTS["conference_area"] * conference_score
        + WEIGHTS["institution_department"] * inst_dept_score
        + WEIGHTS["network_citation"] * network_score
    )
    match_score = max(0, min(100, round(weighted * 100)))

    shared_interests = _display_terms(target_ctx["interests"] & cand_interests)
    shared_skills = _display_terms(target_ctx["skills"] & cand_skills)
    complementary_skills = _display_terms(cand_skills - target_ctx["skills"])

    return {
        "researcher": candidate,
        "match_score": match_score,
        "shared_interests": shared_interests,
        "shared_skills": shared_skills,
        "complementary_skills": complementary_skills,
        "breakdown": {
            "research_interest_similarity": round(interest_score * 100),
            "skills_similarity": round(skills_score * 100),
            "publication_topic_similarity": round(topic_score * 100),
            "conference_area_match": round(conference_score * 100),
            "institution_department_relevance": round(inst_dept_score * 100),
            "network_citation_relationship": round(network_score * 100),
        },
        "data_available": {
            "research_interest": bool(target_ctx["interests"] and cand_interests),
            "skills": bool(target_ctx["skills"] and cand_skills),
            "publications": bool(target_ctx["pubs"] and cand_pubs),
            "conferences": bool(target_ctx["conferences"] and cand_conferences),
        },
    }


def get_collaboration_recommendations(db: Session, researcher_id: int, limit: int = DEFAULT_RECOMMENDATION_LIMIT):
    """Returns collaboration recommendations for a researcher, or None if
    the researcher does not exist (caller should raise 404)."""

    target = db.query(Researcher).filter(Researcher.id == researcher_id).first()
    if not target:
        return None

    candidates = db.query(Researcher).filter(Researcher.id != researcher_id).all()

    if not candidates:
        return {"researcher": _researcher_summary(target), "recommendations": []}

    target_pubs = _researcher_publications(db, researcher_id)
    target_ctx = {
        "interests": _split_terms(target.research_interest),
        "skills": _split_terms(target.skills),
        "pubs": target_pubs,
        "pub_ids": {p.id for p in target_pubs},
        "terms": _publication_topic_terms(target_pubs),
        "conferences": _conference_ids(db, researcher_id),
    }

    scored = [_score_pair(db, target, target_ctx, candidate) for candidate in candidates]
    scored.sort(key=lambda entry: entry["match_score"], reverse=True)
    top_matches = scored[: max(1, limit)]

    recommendations = []
    for entry in top_matches:
        candidate = entry["researcher"]
        explanation = generate_explanation(target, candidate, entry)
        recommendations.append(
            {
                "researcher_id": candidate.id,
                "name": candidate.full_name,
                "institution": candidate.institution,
                "department": candidate.department,
                "match_score": entry["match_score"],
                "shared_interests": entry["shared_interests"],
                "shared_skills": entry["shared_skills"],
                "complementary_skills": entry["complementary_skills"],
                "score_breakdown": entry["breakdown"],
                "data_available": entry["data_available"],
                "reason": explanation["text"],
                "explanation_source": explanation["source"],
            }
        )

    return {
        "researcher": _researcher_summary(target),
        "recommendations": recommendations,
    }


# ---------------------------------------------------------------------------
# Explanation generation: LLM first, rule-based fallback always available.
# ---------------------------------------------------------------------------

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = os.getenv("AI_COLLABORATION_MODEL", "claude-haiku-4-5-20251001")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

# The project's .env ships an OpenRouter key (OPENROUTER_API_KEY, formatted
# "sk-or-v1-...") rather than a native Anthropic key. Support both providers
# so the feature actually calls an LLM with whichever key is configured,
# instead of always silently falling back to the rule-based explanation.
# If both happen to be set, the native Anthropic key wins.
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("AI_COLLABORATION_MODEL_OPENROUTER", "anthropic/claude-haiku-4.5")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

_LLM_TIMEOUT_SECONDS = 10.0


def _rule_based_explanation(target, candidate, entry):
    """Simple, deterministic explanation built only from retrieved facts.
    Used whenever the LLM is unavailable/disabled/erroring."""

    parts = []
    if entry["shared_interests"]:
        parts.append(
            f"overlapping research interests in {', '.join(entry['shared_interests'][:3])}"
        )
    if entry["complementary_skills"]:
        parts.append(
            f"complementary skills in {', '.join(entry['complementary_skills'][:3])}"
        )
    elif entry["shared_skills"]:
        parts.append(f"shared skills in {', '.join(entry['shared_skills'][:3])}")
    if entry["breakdown"]["network_citation_relationship"] > 0:
        parts.append("an existing collaboration or citation link in the database")
    if entry["breakdown"]["institution_department_relevance"] >= 100:
        parts.append("shared institutional affiliation")

    if not parts:
        text = (
            f"{candidate.full_name} does not yet share recorded research interests, "
            f"skills, or publication topics with {target.full_name} in the database, "
            "so this match reflects only limited profile overlap."
        )
    else:
        level = (
            "High" if entry["match_score"] >= 70
            else "Moderate" if entry["match_score"] >= 40
            else "Limited"
        )
        text = f"{level} compatibility due to {'; '.join(parts)}."

    return {"text": text, "source": "rule_based"}


def _ai_explanation(target, candidate, entry):
    """Ask the LLM to phrase an explanation using ONLY the structured facts
    passed in. Returns None (never raises) on any failure so the caller can
    fall back to the rule-based explanation."""

    if not ANTHROPIC_API_KEY and not OPENROUTER_API_KEY:
        return None

    facts = {
        "researcher_a_name": target.full_name,
        "researcher_a_institution": target.institution or None,
        "researcher_b_name": candidate.full_name,
        "researcher_b_institution": candidate.institution or None,
        "shared_research_interests": entry["shared_interests"] or None,
        "shared_skills": entry["shared_skills"] or None,
        "researcher_b_complementary_skills": entry["complementary_skills"] or None,
        "existing_collaboration_or_citation_link": entry["breakdown"]["network_citation_relationship"] > 0,
        "same_institution": entry["breakdown"]["institution_department_relevance"] >= 100,
        "ai_assisted_match_score_percent": entry["match_score"],
    }

    system_prompt = (
        "You write short, professional explanations of why two researchers on a "
        "research-collaboration platform could be good potential collaborators. "
        "You are given ONLY verified facts retrieved from a database as JSON. "
        "Use ONLY the facts provided. Never invent researchers, publications, "
        "skills, institutions, conferences, or collaborations. Do not mention "
        "fields that are null or empty. Write 1-3 concise sentences in a "
        "professional tone, with no headings, labels, or markdown formatting. "
        "Do not claim the score is scientifically validated -- it is an "
        "AI-assisted compatibility estimate."
    )
    user_prompt = (
        "Verified facts (JSON):\n"
        f"{json.dumps(facts, indent=2)}\n\n"
        "Write a concise explanation of why Researcher B could be a strong "
        "potential collaborator for Researcher A, based only on these facts."
    )

    try:
        with httpx.Client(timeout=_LLM_TIMEOUT_SECONDS) as client:
            if ANTHROPIC_API_KEY:
                # Native Anthropic Messages API.
                response = client.post(
                    ANTHROPIC_API_URL,
                    headers={
                        "x-api-key": ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": ANTHROPIC_MODEL,
                        "max_tokens": 220,
                        "system": system_prompt,
                        "messages": [{"role": "user", "content": user_prompt}],
                    },
                )
                response.raise_for_status()
                payload = response.json()
                text_blocks = [
                    block.get("text", "")
                    for block in payload.get("content", [])
                    if block.get("type") == "text"
                ]
                text = " ".join(block.strip() for block in text_blocks if block.strip())
            else:
                # OpenRouter (OpenAI-compatible chat completions), used when
                # only OPENROUTER_API_KEY is configured -- this is the key
                # actually shipped in this project's .env.
                response = client.post(
                    OPENROUTER_API_URL,
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "content-type": "application/json",
                    },
                    json={
                        "model": OPENROUTER_MODEL,
                        "max_tokens": 220,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                    },
                )
                response.raise_for_status()
                payload = response.json()
                choices = payload.get("choices", [])
                text = (
                    choices[0].get("message", {}).get("content", "").strip()
                    if choices
                    else ""
                )

        if not text:
            return None
        return {"text": text, "source": "ai"}

    except Exception as exc:  # noqa: BLE001 -- any failure must fall back, never crash
        logger.warning(
            "AI Collaboration: LLM explanation failed, using rule-based fallback (%s)",
            exc,
        )
        return None


def generate_explanation(target, candidate, entry):
    """LLM explanation when available and configured; rule-based fallback
    otherwise. Never raises -- the recommendation list must always render."""
    ai_result = _ai_explanation(target, candidate, entry)
    if ai_result:
        return ai_result
    return _rule_based_explanation(target, candidate, entry)
