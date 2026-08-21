import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import {
  getPublications,
} from "../api/publications";
import {
  addCitation,
  removeCitation,
  getCitationsMade,
  getCitationsReceived,
} from "../api/citations";
import "./Citations.css";

export default function Citations() {
  const [publications, setPublications] = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);
  const [citationsMade, setCitationsMade] = useState([]);
  const [citationsReceived, setCitationsReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    citing_publication_id: "",
    cited_publication_id: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const loadPublications = async () => {
    setLoading(true);

    try {
      const res = await getPublications();
      const data = res.data || [];

      setPublications(data);

      if (data.length > 0) {
        setSelectedPub((current) => current || data[0]);
      }

      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load publication records.");
    } finally {
      setLoading(false);
    }
  };

  const loadCitations = async (pub) => {
    if (!pub) return;

    try {
      const [madeRes, receivedRes] = await Promise.all([
        getCitationsMade(pub.id),
        getCitationsReceived(pub.id),
      ]);

      setCitationsMade(madeRes.data || []);
      setCitationsReceived(receivedRes.data || []);
    } catch (err) {
      console.error("Failed to load citation list.", err);
      setCitationsMade([]);
      setCitationsReceived([]);
    }
  };

  useEffect(() => {
    loadPublications();
  }, []);

  useEffect(() => {
    if (!selectedPub) return;

    loadCitations(selectedPub);

    setForm((prev) => ({
      ...prev,
      citing_publication_id: selectedPub.id.toString(),
    }));
  }, [selectedPub]);

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  const handleAddCitation = async (e) => {
    e.preventDefault();

    if (
      !form.citing_publication_id ||
      !form.cited_publication_id
    ) {
      setError("Please select both publications.");
      return;
    }

    if (
      form.citing_publication_id ===
      form.cited_publication_id
    ) {
      setError("A publication cannot cite itself.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addCitation({
        citing_publication_id: parseInt(
          form.citing_publication_id,
          10
        ),
        cited_publication_id: parseInt(
          form.cited_publication_id,
          10
        ),
      });

      setForm((prev) => ({
        ...prev,
        cited_publication_id: "",
      }));

      if (selectedPub) {
        await loadCitations(selectedPub);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to create citation link."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (citingId, citedId) => {
    const confirmed = window.confirm(
      "Remove this citation connection?"
    );

    if (!confirmed) return;

    try {
      await removeCitation(citingId, citedId);

      if (selectedPub) {
        await loadCitations(selectedPub);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to remove citation.");
    }
  };

  const getPublicationTitle = (id) => {
    const publication = publications.find(
      (pub) => pub.id === id
    );

    return publication
      ? publication.title
      : `Publication #${id}`;
  };

  const getShortTitle = (title) => {
    if (!title) return "Untitled publication";

    return title.length > 72
      ? `${title.substring(0, 72)}...`
      : title;
  };

  return (
    <AppShell>
      <main className="citation-page">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="citation-hero">

          <div className="citation-hero-main">

            <div className="citation-eyebrow">
              <span className="citation-badge">
                Citation Intelligence
              </span>

              <span className="citation-module-tag">
                Research Impact
              </span>
            </div>

            <p className="citation-kicker">
              Publication Relationship Analysis
            </p>

            <h1>
              Citation &{" "}
              <span>Reference Network</span>
            </h1>

            <p className="citation-description">
              Track scholarly relationships between publications,
              manage references, and understand how research
              connects across your publication network.
            </p>

            <div className="citation-hero-stats">
              <div className="citation-mini-stat">
                <strong>{publications.length}</strong>
                <span>Publications</span>
              </div>

              <div className="citation-mini-stat">
                <strong>{citationsMade.length}</strong>
                <span>References Made</span>
              </div>

              <div className="citation-mini-stat">
                <strong>{citationsReceived.length}</strong>
                <span>Citations Received</span>
              </div>
            </div>

          </div>

          <div className="citation-network-visual">
            <div className="citation-orbit orbit-one"></div>
            <div className="citation-orbit orbit-two"></div>
            <div className="citation-orbit orbit-three"></div>

            <div className="citation-center-node">
              <span>↗</span>
            </div>

            <div className="citation-node node-one">P1</div>
            <div className="citation-node node-two">P2</div>
            <div className="citation-node node-three">P3</div>
            <div className="citation-node node-four">P4</div>
          </div>

        </section>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading ? (
          <section className="citation-status-card">
            <div className="citation-spinner"></div>
            <span>Loading publication records...</span>
          </section>
        ) : (
          <>
            {/* =================================================
                MAIN EXPLORER
            ================================================= */}

            <section className="citation-section">

              <div className="citation-section-heading">
                <div>
                  <span className="citation-section-label">
                    Reference Explorer
                  </span>

                  <h2>
                    Explore Publication Connections
                  </h2>
                </div>

                <p>
                  Select a publication to inspect its citation network.
                </p>
              </div>

              <div className="citation-layout">

                {/* =============================================
                    PUBLICATION LIST
                ============================================= */}

                <aside className="citation-sidebar">

                  <div className="citation-sidebar-header">
                    <div>
                      <span className="citation-small-label">
                        Library
                      </span>

                      <h3>Publications</h3>
                    </div>

                    <span className="citation-count">
                      {publications.length}
                    </span>
                  </div>

                  <p className="citation-sidebar-copy">
                    Choose a paper to view references and citation
                    relationships.
                  </p>

                  <div className="citation-publication-list">

                    {publications.length === 0 ? (
                      <div className="citation-empty">
                        No publications have been added yet.
                      </div>
                    ) : (
                      publications.map((pub) => (
                        <button
                          key={pub.id}
                          type="button"
                          className={`citation-publication-item ${
                            selectedPub?.id === pub.id
                              ? "is-selected"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedPub(pub)
                          }
                        >
                          <div className="citation-publication-icon">
                            P
                          </div>

                          <div className="citation-publication-info">
                            <strong>
                              {getShortTitle(pub.title)}
                            </strong>

                            <span>
                              {pub.type || "Publication"}
                              {" • "}
                              {pub.status || "Unknown status"}
                            </span>
                          </div>

                          <span className="citation-arrow">
                            →
                          </span>
                        </button>
                      ))
                    )}

                  </div>

                </aside>

                {/* =============================================
                    DETAIL
                ============================================= */}

                <section className="citation-detail">

                  {!selectedPub ? (
                    <div className="citation-empty-detail">
                      <div className="citation-empty-icon">
                        ⟷
                      </div>

                      <h3>
                        No publication selected
                      </h3>

                      <p>
                        Add a publication to begin exploring
                        citation relationships.
                      </p>
                    </div>
                  ) : (
                    <>

                      {/* Selected publication */}

                      <div className="selected-publication">

                        <div className="selected-publication-top">

                          <div className="selected-paper-icon">
                            P
                          </div>

                          <div>
                            <span className="citation-small-label">
                              Selected Publication
                            </span>

                            <h2>
                              {selectedPub.title}
                            </h2>
                          </div>

                        </div>

                        <div className="selected-paper-meta">

                          <div>
                            <span>TYPE</span>
                            <strong>
                              {selectedPub.type || "—"}
                            </strong>
                          </div>

                          <div>
                            <span>STATUS</span>
                            <strong>
                              {selectedPub.status || "—"}
                            </strong>
                          </div>

                          <div>
                            <span>DOI</span>
                            <strong>
                              {selectedPub.doi || "Not available"}
                            </strong>
                          </div>

                        </div>

                      </div>

                      {/* Add Citation */}

                      <form
                        onSubmit={handleAddCitation}
                        className="citation-form"
                      >

                        <div className="citation-form-heading">
                          <div className="citation-form-icon">
                            +
                          </div>

                          <div>
                            <span className="citation-small-label">
                              Create Relationship
                            </span>

                            <h3>
                              Declare Citation
                            </h3>

                            <p>
                              Select the publication referenced
                              by this paper.
                            </p>
                          </div>
                        </div>

                        <div className="citation-form-row">

                          <select
                            name="cited_publication_id"
                            value={
                              form.cited_publication_id
                            }
                            onChange={handleFormChange}
                            required
                            className="citation-select"
                          >
                            <option value="">
                              Select cited publication...
                            </option>

                            {publications
                              .filter(
                                (pub) =>
                                  pub.id !== selectedPub.id
                              )
                              .map((pub) => (
                                <option
                                  key={pub.id}
                                  value={pub.id}
                                >
                                  {pub.title}
                                </option>
                              ))}
                          </select>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="citation-primary-button"
                          >
                            {submitting
                              ? "Adding..."
                              : "Add Citation"}
                          </button>

                        </div>

                        {error && (
                          <div className="citation-error">
                            <strong>!</strong>
                            <span>{error}</span>
                          </div>
                        )}

                      </form>

                      {/* Citation Lists */}

                      <div className="citation-network-grid">

                        {/* References Made */}

                        <div className="citation-list-card">

                          <div className="citation-list-heading">

                            <div className="citation-list-icon">
                              ↗
                            </div>

                            <div>
                              <h3>
                                References Made
                              </h3>

                              <p>
                                Publications cited by this paper
                              </p>
                            </div>

                            <span className="citation-list-count">
                              {citationsMade.length}
                            </span>

                          </div>

                          <div className="citation-list">

                            {citationsMade.length === 0 ? (
                              <div className="citation-list-empty">
                                <span>○</span>
                                <p>
                                  This publication does not
                                  cite other papers yet.
                                </p>
                              </div>
                            ) : (
                              citationsMade.map((citation) => (
                                <div
                                  key={citation.id}
                                  className="citation-row"
                                >
                                  <div className="citation-row-marker">
                                    ↗
                                  </div>

                                  <div className="citation-row-content">
                                    <strong>
                                      {getPublicationTitle(
                                        citation.cited_publication_id
                                      )}
                                    </strong>

                                    <span>
                                      Cited publication
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    className="citation-remove"
                                    title="Remove citation"
                                    onClick={() =>
                                      handleRemove(
                                        citation.citing_publication_id,
                                        citation.cited_publication_id
                                      )
                                    }
                                  >
                                    ×
                                  </button>
                                </div>
                              ))
                            )}

                          </div>

                        </div>

                        {/* Citations Received */}

                        <div className="citation-list-card">

                          <div className="citation-list-heading">

                            <div className="citation-list-icon received">
                              ↙
                            </div>

                            <div>
                              <h3>
                                Citations Received
                              </h3>

                              <p>
                                Publications referencing this paper
                              </p>
                            </div>

                            <span className="citation-list-count">
                              {citationsReceived.length}
                            </span>

                          </div>

                          <div className="citation-list">

                            {citationsReceived.length === 0 ? (
                              <div className="citation-list-empty">
                                <span>○</span>
                                <p>
                                  This publication has not
                                  been cited yet.
                                </p>
                              </div>
                            ) : (
                              citationsReceived.map(
                                (citation) => (
                                  <div
                                    key={citation.id}
                                    className="citation-row"
                                  >
                                    <div className="citation-row-marker received">
                                      ↙
                                    </div>

                                    <div className="citation-row-content">
                                      <strong>
                                        {getPublicationTitle(
                                          citation.citing_publication_id
                                        )}
                                      </strong>

                                      <span>
                                        Citing publication
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      className="citation-remove"
                                      title="Remove citation"
                                      onClick={() =>
                                        handleRemove(
                                          citation.citing_publication_id,
                                          citation.cited_publication_id
                                        )
                                      }
                                    >
                                      ×
                                    </button>
                                  </div>
                                )
                              )
                            )}

                          </div>

                        </div>

                      </div>

                    </>
                  )}

                </section>

              </div>
            </section>
          </>
        )}

      </main>
    </AppShell>
  );
}