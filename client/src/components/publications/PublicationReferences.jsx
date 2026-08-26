import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaBookOpen } from "react-icons/fa";
import API from "../../services/api";

function PublicationReferences({ publicationId, publications = [], onOpen }) {
  const [citations, setCitations] = useState([]);
  const [catalog, setCatalog] = useState(publications);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCatalog(publications);
  }, [publications]);

  useEffect(() => {
    if (!publicationId) return undefined;
    let active = true;
    setLoading(true);
    Promise.all([
      API.get(`/citation/${publicationId}`),
      publications.length ? Promise.resolve({ data: publications }) : API.get("/publications/"),
    ])
      .then(([citationResponse, publicationResponse]) => {
        if (!active) return;
        setCitations(citationResponse.data || []);
        setCatalog(publicationResponse.data || []);
      })
      .catch(() => {
        if (active) setCitations([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [publicationId, publications]);

  const references = useMemo(() => (
    citations
      .map((citation) => ({
        citation,
        publication: catalog.find((item) => item.id === citation.cited_publication_id),
      }))
      .filter(({ publication }) => Boolean(publication))
  ), [catalog, citations]);

  if (!publicationId) return null;

  return (
    <section className="publication-references" aria-label="Publication references">
      <div className="publication-references-heading">
        <span><FaBookOpen aria-hidden="true" /> References</span>
        {loading && <small>Loading...</small>}
      </div>
      {!loading && references.length === 0 ? (
        <p className="reference-empty">No references saved for this publication.</p>
      ) : (
        <div className="publication-reference-list">
          {references.map(({ citation, publication }) => (
            <button
              type="button"
              key={citation.id}
              onClick={() => onOpen?.(publication.id)}
              className="publication-reference-link"
              disabled={!onOpen}
            >
              <FaArrowRight aria-hidden="true" />
              <span>
                <strong>{publication.title}</strong>
                <small>
                  {[publication.authors, publication.publication_year, publication.publication_type]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default PublicationReferences;
