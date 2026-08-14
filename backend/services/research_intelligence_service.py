from collections import Counter, defaultdict
from itertools import combinations

from backend.database.models import Institution, Publication, User
from backend.models.friend_request import FriendRequest


def _terms(value: str | None) -> list[str]:
    return [item.strip() for item in (value or "").replace(";", ",").split(",") if item.strip()]


def build_research_intelligence(current_user: User, db) -> dict:
    researchers = db.query(User).filter(
        User.role == "Researcher", User.account_status == "Active", User.is_verified.is_(True)
    ).all()
    publications_query = db.query(Publication)
    if current_user.role == "Institution Admin":
        publications_query = publications_query.filter(Publication.institution_id == current_user.institution_id)
    publications = publications_query.all()

    interest_counts = Counter(term for researcher in researchers for term in _terms(researcher.research_interests))
    keyword_counts = Counter(term for publication in publications for term in _terms(publication.keywords))
    publication_counts = Counter(publication.researcher_id for publication in publications)
    institution_counts = Counter(publication.institution_id for publication in publications if publication.institution_id)
    researcher_names = {researcher.id: researcher.name for researcher in researchers}
    institution_names = {institution.id: institution.name for institution in db.query(Institution).all()}

    activity_by_year = Counter()
    keyword_by_year = defaultdict(Counter)
    for publication in publications:
        year = publication.publication_year or (publication.uploaded_at.year if publication.uploaded_at else None)
        if year:
            activity_by_year[str(year)] += 1
            keyword_by_year[str(year)].update(_terms(publication.keywords))
    years = sorted(activity_by_year)
    historical_sufficient = len(years) >= 3
    trend_message = None if historical_sufficient else "Insufficient historical data to determine a reliable trend."
    emerging_areas = []
    if historical_sufficient:
        for keyword in keyword_counts:
            first = keyword_by_year[years[0]][keyword]
            latest = keyword_by_year[years[-1]][keyword]
            if latest > first:
                emerging_areas.append({"label": keyword, "value": latest - first})
        emerging_areas.sort(key=lambda item: item["value"], reverse=True)

    collaborations_query = db.query(FriendRequest).filter(FriendRequest.status == "Accepted")
    if current_user.role == "Researcher":
        collaborations_query = collaborations_query.filter(
            (FriendRequest.sender_id == current_user.id) | (FriendRequest.receiver_id == current_user.id)
        )
    elif current_user.role == "Institution Admin":
        institution_user_ids = [user_id for (user_id,) in db.query(User.id).filter(User.institution_id == current_user.institution_id).all()]
        collaborations_query = collaborations_query.filter(
            FriendRequest.sender_id.in_(institution_user_ids) | FriendRequest.receiver_id.in_(institution_user_ids)
        ) if institution_user_ids else collaborations_query.filter(False)
    collaborations = collaborations_query.all()
    collaboration_counts = Counter()
    connected_ids = set()
    for collaboration in collaborations:
        collaboration_counts[collaboration.sender_id] += 1
        collaboration_counts[collaboration.receiver_id] += 1
        connected_ids.update((collaboration.sender_id, collaboration.receiver_id))
    user_by_id = {user.id: user for user in db.query(User).filter(User.id.in_(connected_ids)).all()} if connected_ids else {}
    institution_collaborations = Counter(
        user_by_id[user_id].institution_id
        for user_id in connected_ids
        if user_id in user_by_id and user_by_id[user_id].institution_id
    )
    collaboration_interests = Counter(
        term for user_id in connected_ids if user_id in user_by_id for term in _terms(user_by_id[user_id].research_interests)
    )

    existing_pairs = {tuple(sorted((item.sender_id, item.receiver_id))) for item in collaborations}
    potential = []
    candidate_researchers = researchers
    if current_user.role == "Researcher":
        candidate_researchers = [item for item in researchers if item.id == current_user.id or item.id != current_user.id]
    for left, right in combinations(candidate_researchers, 2):
        if current_user.role == "Researcher" and current_user.id not in {left.id, right.id}:
            continue
        if tuple(sorted((left.id, right.id))) in existing_pairs:
            continue
        overlap = sorted(set(_terms(left.research_interests)) & set(_terms(right.research_interests)))
        if overlap:
            potential.append({"researchers": f"{left.name} and {right.name}", "shared_interests": overlap[:5], "reason": f"Both profiles list overlapping interests: {', '.join(overlap[:5])}."})
    potential.sort(key=lambda item: len(item["shared_interests"]), reverse=True)

    return {
        "overview": {
            "researchers": len(researchers),
            "publications": len(publications),
            "collaborations": len(collaborations),
            "research_areas": len(interest_counts),
        },
        "research_trends": {
            "top_interests": [{"label": label, "value": count} for label, count in interest_counts.most_common(10)],
            "top_keywords": [{"label": label, "value": count} for label, count in keyword_counts.most_common(10)],
            "publication_activity": [{"label": year, "value": activity_by_year[year]} for year in years],
            "emerging_areas": emerging_areas[:10],
            "trend_message": trend_message,
            "low_activity_areas": [{"label": label, "value": count} for label, count in sorted(interest_counts.items(), key=lambda item: (item[1], item[0]))[:5]],
            "active_researchers": [{"label": researcher_names.get(user_id, "Unknown"), "value": count} for user_id, count in publication_counts.most_common(5) if user_id in researcher_names],
            "active_institutions": [{"label": institution_names.get(institution_id, "Unknown"), "value": count} for institution_id, count in institution_counts.most_common(5)],
        },
        "collaboration_insights": {
            "connected_researchers": [{"label": user_by_id[user_id].name, "value": count} for user_id, count in collaboration_counts.most_common(10) if user_id in user_by_id],
            "institutions": [{"label": institution_names.get(institution_id, "Unknown"), "value": count} for institution_id, count in institution_collaborations.most_common(10)],
            "common_research_areas": [{"label": label, "value": count} for label, count in collaboration_interests.most_common(10)],
            "potential_opportunities": potential[:10],
        },
    }
