import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";
import { fetchPublishedPublications, downloadPublicationFile } from "../services/publicationService";
import CitationPanel from "../components/publication/CitationPanel";
import "../styles/publications.css";

function BrowsePublicationsPage() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("newest");

  const loadPublications = async () => {
    try {
      setLoading(true);
      const data = await fetchPublishedPublications(search, typeFilter, sort);
      setPublications(data);
    } catch (err) {
      toast.error("Could not load publications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, [typeFilter, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPublications();
  };

  return (
    <DashboardLayout>
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <h4 className="fw-bold mb-1">Browse Publications</h4>
          <p className="text-muted mb-3">Published work from researchers across all institutions.</p>

          <form onSubmit={handleSearch} className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="d-flex gap-2 mt-2">
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All types</option>
              <option value="JOURNAL_PAPER">Journal Paper</option>
              <option value="CONFERENCE_PAPER">Conference Paper</option>
              <option value="BOOK">Book</option>
              <option value="PATENT">Patent</option>
              <option value="TECHNICAL_REPORT">Technical Report</option>
            </select>
            <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : publications.length === 0 ? (
        <div className="pub-empty"><p>No published papers found.</p></div>
      ) : (
        <div className="pub-list">
          {publications.map((pub) => {
            const fileUrl = pub.file_path || null;
            const isArchived = pub.status === "ARCHIVED";

            return (
              <div className="pub-item" key={pub.id}>
                <div className="pub-item-header">
                  <div>
                    <span className="pub-type-label">{pub.publication_type?.replaceAll("_", " ")}</span>
                    <h4>{pub.title}</h4>
                  </div>
                  <span className={isArchived ? "pub-badge pub-badge-draft" : "pub-badge pub-badge-published"}>
                    {isArchived ? "Archived" : "Published"}
                  </span>
                </div>

                <p className="pub-meta" style={{ marginBottom: "0.5rem" }}>
                  By {pub.owner_first_name} {pub.owner_last_name}
                </p>

                {pub.abstract && <p className="pub-abstract">{pub.abstract}</p>}

                <div className="pub-meta">
                  {pub.authors_text && <span>Co-authors: {pub.authors_text}</span>}
                  {pub.doi && <span className="mono">DOI: {pub.doi}</span>}
                  {pub.publish_date && <span>{new Date(pub.publish_date).toLocaleDateString()}</span>}
                </div>

                {fileUrl && (
                  <div className="pub-file-row">
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="pub-file-link">
                      View document
                    </a>
                    <button
                      type="button"
                      className="btn-ghost-outline btn-sm"
                      onClick={async () => {
                        try {
                          await downloadPublicationFile(pub.id);
                        } catch (err) {
                          toast.error("Could not download file.");
                        }
                      }}
                    >
                      Download
                    </button>
                  </div>
                )}

                <CitationPanel publicationId={pub.id} canEdit={false} />
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default BrowsePublicationsPage;