import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { fetchReviewQueue, claimPublication, decideReview } from "../../services/publicationService";
import "../../styles/publications.css";

function ReviewerDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);
  const [comments, setComments] = useState({});

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await fetchReviewQueue();
      setQueue(data);
    } catch (err) {
      toast.error("Could not load review queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id) => {
    try {
      await claimPublication(id);
      toast.success("Claimed for review.");
      await loadQueue();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not claim publication.");
    }
  };

  const handleDecide = async (id, approve) => {
    setDecidingId(id);
    try {
      await decideReview(id, { approve, comments: comments[id] || "" });
      toast.success(approve ? "Publication approved." : "Publication rejected.");
      await loadQueue();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not submit decision.");
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <DashboardShell title="Reviewer Dashboard" subtitle="Papers assigned to you for review.">
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">{queue.length}</div>
          <div className="stat-label">In queue</div>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && queue.length === 0 && (
        <div className="pub-empty">
          <p>No publications waiting for review right now.</p>
        </div>
      )}

      <div className="pub-list">
        {queue.map((pub) => {
          const fileUrl = pub.file_path
            ? `http://127.0.0.1:8000/${pub.file_path.replace(/\\/g, "/")}`
            : null;

          return (
            <div className="pub-item" key={pub.id}>
              <div className="pub-item-header">
                <h4>{pub.title}</h4>
                <span className={`pub-badge pub-badge-${pub.status === "SUBMITTED" ? "submitted" : "review"}`}>
                  {pub.status === "SUBMITTED" ? "Submitted" : "Under review (you)"}
                </span>
              </div>

              {pub.abstract && <p className="pub-abstract">{pub.abstract}</p>}

              <div className="pub-meta">
                {pub.authors_text && <span>Co-authors: {pub.authors_text}</span>}
                {pub.doi && <span className="mono">DOI: {pub.doi}</span>}
              </div>

              {fileUrl && (
                <div className="pub-file-row">
                  <a href={fileUrl} target="_blank" rel="noreferrer" className="pub-file-link">
                    View uploaded document
                  </a>
                </div>
              )}

              {pub.status === "SUBMITTED" && (
                <div className="pub-item-actions">
                  <button className="btn-primary" onClick={() => handleClaim(pub.id)}>
                    Claim for review
                  </button>
                </div>
              )}

              {pub.status === "UNDER_REVIEW" && (
                <div className="pub-review-form">
                  <textarea
                    placeholder="Review comments (optional)"
                    value={comments[pub.id] || ""}
                    onChange={(e) => setComments({ ...comments, [pub.id]: e.target.value })}
                  />
                  <div className="pub-item-actions">
                    <button
                      className="btn-approve"
                      disabled={decidingId === pub.id}
                      onClick={() => handleDecide(pub.id, true)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-reject"
                      disabled={decidingId === pub.id}
                      onClick={() => handleDecide(pub.id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}

export default ReviewerDashboard;