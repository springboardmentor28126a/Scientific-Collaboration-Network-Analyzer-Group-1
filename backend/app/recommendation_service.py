"""Explainable, database-backed recommendation helpers.

This module deliberately uses no external AI provider.  It builds TF-IDF vectors
from the data already held by the application and combines cosine similarity with
explicit interest/skill overlap.  This makes scores repeatable and works offline.
"""
from __future__ import annotations

from collections import Counter
from math import log, sqrt
import re


STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in",
    "is", "it", "of", "on", "or", "that", "the", "this", "to", "with",
}


def split_topics(value: str | None) -> list[str]:
    """Split the application's comma/newline separated interest and skill fields."""
    return [item.strip() for item in re.split(r"[,;\n]", value or "") if item.strip()]


def tokens(value: str | None) -> list[str]:
    return [word for word in re.findall(r"[a-z0-9+#.-]+", (value or "").lower()) if len(word) > 1 and word not in STOP_WORDS]


def normalized_overlap(left: list[str], right: list[str]) -> list[str]:
    right_by_key = {item.casefold(): item for item in right}
    return [item for item in left if item.casefold() in right_by_key]


def jaccard(left: list[str], right: list[str]) -> float:
    a, b = {x.casefold() for x in left}, {x.casefold() for x in right}
    return len(a & b) / len(a | b) if a and b else 0.0


def tfidf_cosine(query: str, documents: list[str]) -> list[float]:
    """Return a cosine score for query against each document without new packages."""
    all_docs = [tokens(query), *[tokens(document) for document in documents]]
    if not all_docs[0]:
        return [0.0] * len(documents)
    document_frequency = Counter({term: sum(term in set(doc) for doc in all_docs) for doc in all_docs for term in set(doc)})
    total = len(all_docs)

    def vector(words: list[str]) -> dict[str, float]:
        counts = Counter(words)
        return {term: count * (log((total + 1) / (document_frequency[term] + 1)) + 1) for term, count in counts.items()}

    query_vector = vector(all_docs[0])
    query_norm = sqrt(sum(weight * weight for weight in query_vector.values()))
    scores = []
    for words in all_docs[1:]:
        candidate_vector = vector(words)
        denominator = query_norm * sqrt(sum(weight * weight for weight in candidate_vector.values()))
        dot = sum(weight * candidate_vector.get(term, 0) for term, weight in query_vector.items())
        scores.append(dot / denominator if denominator else 0.0)
    return scores


def profile_text(profile, publications) -> str:
    paper_text = " ".join(f"{publication.title or ''} {publication.abstract or ''}" for publication in publications)
    return " ".join([profile.research_interests or "", profile.skills or "", profile.bio or "", paper_text])


def shared_terms(query: str, document: str, limit: int = 5) -> list[str]:
    query_terms, document_terms = tokens(query), set(tokens(document))
    return list(dict.fromkeys(term for term in query_terms if term in document_terms))[:limit]
