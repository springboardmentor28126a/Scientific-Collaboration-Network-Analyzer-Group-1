import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardShell from "../../components/dashboard/DashboardShell";
import PublicationForm from "../../components/publication/PublicationForm";
import PublicationList from "../../components/publication/PublicationList";

import {
  fetchMyPublications,
  createPublication,
  updatePublication,
  submitPublication,
  deletePublication,
} from "../../services/publicationService";
import { fetchMyConferenceRegistrations, cancelConferenceRegistration } from "../../services/conferenceService";
import "../../styles/publications.css";

function ResearcherDashboard() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPublication, setEditingPublication] = useState(null);
  const [myConferences, setMyConferences] = useState([]);

useEffect(() => {
  loadMyConferences();
}, []);

const loadMyConferences = async () => {
  try {
    const data = await fetchMyConferenceRegistrations();
    setMyConferences(data);
  } catch (err) {
    // silent fail is fine here, non-critical section
  }
};

const handleCancelRegistration = async (id) => {
  const confirmed = window.confirm("Cancel this conference registration?");
  if (!confirmed) return;
  try {
    await cancelConferenceRegistration(id);
    toast.success("Registration cancelled.");
    await loadMyConferences();
  } catch (err) {
    toast.error("Could not cancel registration.");
  }
};
  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const data = await fetchMyPublications();
      setPublications(data);
    } catch (err) {
      toast.error("Could not load your publications.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (payload) => {
    try {
      if (editingPublication) {
        await updatePublication(editingPublication.id, payload);
        toast.success("Publication updated.");
      } else {
        await createPublication(payload);
        toast.success("Publication added as draft.");
      }
      setEditingPublication(null);
      await loadPublications();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save publication.");
    }
  };

  const handleSubmitForReview = async (id) => {
    try {
      await submitPublication(id);
      toast.success("Submitted for review.");
      await loadPublications();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not submit publication.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this publication?");
    if (!confirmed) return;

    try {
      await deletePublication(id);
      toast.success("Publication deleted.");
      await loadPublications();
    } catch (err) {
      toast.error("Could not delete publication.");
    }
  };

  const draftCount = publications.filter((p) => p.status === "DRAFT").length;
  const publishedCount = publications.filter((p) => p.status === "PUBLISHED").length;
  const pendingCount = publications.filter((p) => ["SUBMITTED", "UNDER_REVIEW"].includes(p.status)).length;

  return (
    <DashboardShell title="Researcher Dashboard" subtitle="Your publications, projects, and collaborators.">
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">{publications.length}</div>
          <div className="stat-label">Total publications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{publishedCount}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">In review</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{draftCount}</div>
          <div className="stat-label">Drafts</div>
        </div>
      </div>
      <div className="pub-card">
  <h3>My Conferences</h3>
  {myConferences.length === 0 ? (
    <p className="text-muted">You haven't registered for any conferences yet.</p>
  ) : (
    <div className="pub-list">
      {myConferences.map((reg) => (
        <div className="pub-item" key={reg.id}>
          <div className="pub-item-header">
            <h4>{reg.conference.title} {reg.conference.acronym ? `(${reg.conference.acronym})` : ""}</h4>
            <span className={`pub-badge ${reg.role === "PRESENTER" ? "pub-badge-published" : "pub-badge-draft"}`}>
              {reg.role === "PRESENTER" ? "Presenter" : "Attendee"}
            </span>
          </div>
          <div className="pub-meta">
            <span>{reg.conference.venue}{reg.conference.city ? `, ${reg.conference.city}` : ""}</span>
            <span>{new Date(reg.conference.start_date).toLocaleDateString()} – {new Date(reg.conference.end_date).toLocaleDateString()}</span>
          </div>
          {reg.presentation_title && (
            <p className="pub-abstract"><strong>Presenting:</strong> {reg.presentation_title}</p>
          )}
          <div className="pub-item-actions">
            <button className="btn-text-danger" onClick={() => handleCancelRegistration(reg.id)}>
              Cancel registration
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      <PublicationForm
        editingPublication={editingPublication}
        onSave={handleSave}
        onCancel={() => setEditingPublication(null)}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <PublicationList
          publications={publications}
          onEdit={setEditingPublication}
          onSubmit={handleSubmitForReview}
          onDelete={handleDelete}
          onFileUploaded={loadPublications}
        />
      )}
    </DashboardShell>
  );
}

export default ResearcherDashboard;