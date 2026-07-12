const STATUS_STYLES = {
  DRAFT: { label: "Draft", className: "pub-badge pub-badge-draft" },
  SUBMITTED: { label: "Submitted", className: "pub-badge pub-badge-submitted" },
  UNDER_REVIEW: { label: "Under review", className: "pub-badge pub-badge-review" },
  PUBLISHED: { label: "Published", className: "pub-badge pub-badge-published" },
  REJECTED: { label: "Rejected", className: "pub-badge pub-badge-rejected" },
};

function PublicationList({ publications, onEdit, onSubmit, onDelete }) {
  if (publications.length === 0) {
    return (
      <div className="pub-empty">
        <p>No publications yet. Add your first one above.</p>
      </div>
    );
  }

  return (
    <div className="pub-list">
      {publications.map((pub) => {
        const statusInfo = STATUS_STYLES[pub.status] || STATUS_STYLES.DRAFT;
        const canEdit = pub.status === "DRAFT" || pub.status === "REJECTED";

        return (
          <div className="pub-item" key={pub.id}>
            <div className="pub-item-header">
              <h4>{pub.title}</h4>
              <span className={statusInfo.className}>{statusInfo.label}</span>
            </div>

            {pub.abstract && <p className="pub-abstract">{pub.abstract}</p>}

            <div className="pub-meta">
              {pub.authors_text && <span>Co-authors: {pub.authors_text}</span>}
              {pub.doi && <span className="mono">DOI: {pub.doi}</span>}
              {pub.publish_date && <span>{new Date(pub.publish_date).toLocaleDateString()}</span>}
            </div>

            {pub.status === "REJECTED" && pub.review_comments && (
              <div className="pub-review-note">
                <strong>Reviewer feedback:</strong> {pub.review_comments}
              </div>
            )}

            {pub.status === "PUBLISHED" && pub.review_comments && (
              <div className="pub-review-note pub-review-note-positive">
                <strong>Reviewer note:</strong> {pub.review_comments}
              </div>
            )}

            {canEdit && (
              <div className="pub-item-actions">
                <button className="btn-ghost-outline" onClick={() => onEdit(pub)}>Edit</button>
                <button className="btn-primary btn-sm" onClick={() => onSubmit(pub.id)}>
                  Submit for review
                </button>
                <button className="btn-text-danger" onClick={() => onDelete(pub.id)}>Delete</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PublicationList;