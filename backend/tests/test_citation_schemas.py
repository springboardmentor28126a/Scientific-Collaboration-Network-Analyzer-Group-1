from app.schemas import CitationCreate, CitationResponse, ReferenceCreate, ReferenceResponse, NotificationResponse
from app.models import ReferenceType


def test_citation_and_reference_schemas_accept_expected_fields():
    citation = CitationCreate(citing_publication_id=1, cited_publication_id=2)
    reference = ReferenceCreate(
        title="A test reference",
        reference_type=ReferenceType.JOURNAL,
        authors="Jane Doe",
        journal="Nature",
        publisher="Example Press",
        volume="10",
        issue="2",
        pages="1-10",
    )

    assert citation.citing_publication_id == 1
    assert citation.cited_publication_id == 2
    assert reference.reference_type == ReferenceType.JOURNAL
    assert reference.title == "A test reference"


def test_notification_response_can_be_constructed_from_dict_like_payload():
    payload = NotificationResponse(
        id=1,
        user_id=2,
        title="New citation",
        message="A citation was added",
        type="citation_added",
        is_read=False,
        created_at="2026-08-02T00:00:00",
    )

    assert payload.type == "citation_added"
    assert payload.is_read is False
