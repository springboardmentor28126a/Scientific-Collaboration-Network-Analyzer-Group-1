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

import "../../styles/publications.css";

function ResearcherDashboard() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPublication, setEditingPublication] = useState(null);

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