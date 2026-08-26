import { useMemo, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

function ReferenceSelector({
  publications = [],
  selectedIds = [],
  onChange,
  excludeId,
  helperText = "Choose existing publications that this work references.",
}) {
  const [query, setQuery] = useState("");

  const availablePublications = useMemo(() => (
    publications.filter((publication) => publication.id !== excludeId)
  ), [excludeId, publications]);

  const selectedPublications = useMemo(() => (
    selectedIds
      .map((id) => availablePublications.find((publication) => publication.id === id))
      .filter(Boolean)
  ), [availablePublications, selectedIds]);

  const filteredPublications = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return availablePublications;
    return availablePublications.filter((publication) => (
      `${publication.title || ""} ${publication.authors || ""} ${publication.publication_year || ""}`
        .toLowerCase()
        .includes(term)
    ));
  }, [availablePublications, query]);

  const toggleReference = (publicationId) => {
    if (selectedIds.includes(publicationId)) {
      onChange(selectedIds.filter((id) => id !== publicationId));
      return;
    }
    onChange([...selectedIds, publicationId]);
  };

  return (
    <section className="reference-selector" aria-label="Publication references">
      <div className="reference-selector-header">
        <div>
          <span className="eyebrow">Reference network</span>
          <h3>References</h3>
          <p>{helperText}</p>
        </div>
        <span className="status-badge">{selectedIds.length} selected</span>
      </div>

      {selectedPublications.length > 0 && (
        <div className="selected-reference-list" aria-label="Selected references">
          {selectedPublications.map((publication) => (
            <span className="selected-reference-chip" key={publication.id}>
              <span>{publication.title}</span>
              <button
                type="button"
                aria-label={`Remove ${publication.title}`}
                onClick={() => toggleReference(publication.id)}
              >
                <FaTimes aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <label className="reference-search">
        <FaSearch aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search publication title, author, or year"
        />
      </label>

      <div className="reference-option-list">
        {filteredPublications.length === 0 ? (
          <div className="empty-state compact">
            <strong>No reference candidates found</strong>
            <span>Try another publication title or author.</span>
          </div>
        ) : (
          filteredPublications.map((publication) => (
            <label className="reference-option" key={publication.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(publication.id)}
                onChange={() => toggleReference(publication.id)}
              />
              <span>
                <strong>{publication.title}</strong>
                <small>
                  {[publication.authors, publication.publication_year, publication.publication_type]
                    .filter(Boolean)
                    .join(" · ") || "Publication record"}
                </small>
              </span>
            </label>
          ))
        )}
      </div>
    </section>
  );
}

export default ReferenceSelector;
