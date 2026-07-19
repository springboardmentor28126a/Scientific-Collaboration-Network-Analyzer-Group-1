import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";
import { fetchPublishedPublications } from "../services/publicationService";
import "../styles/publications.css";

function BrowsePublicationsPage() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async (query = "") => {
    try {
      setLoading(true);
      const data = await fetchPublishedPublications(query);
      setPublications(data);
    } catch (err) {
      toast.error("Could not load publications.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPublications(search);
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
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : publications.length === 0 ? (
        <div className="pub-empty"><p>No published papers found.</p></div>
      ) : (
        <div className="pub-list">
          {publications.map((pub) => {
            const fileUrl = pub.file_path
              ? `http://127.0.0.1:8000/${pub.file_path.replace(/\\/g, "/")}`
              : null;

            return (
              <div className="pub-item" key={pub.id}>
                <div className="pub-item-header">
                  <h4>{pub.title}</h4>
                  <span className="pub-badge pub-badge-published">Published</span>
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default BrowsePublicationsPage;