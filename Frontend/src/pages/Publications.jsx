import { useEffect, useState } from "react";
import {
  getPublications,
  createPublication,
  updatePublication,
  updatePublicationStatus,
  deletePublication,
  uploadPublicationFile,
} from "../api/publications";
import { getResearchers, getInstitutions } from "../api/researchers";
import AppShell from "../components/AppShell";
import { useAuth } from "../hooks/useAuth";
import "./Publications.css";

const STATUSES = ["Draft", "Submitted", "Published", "Archived"];
const TYPES = ["Journal", "ConferencePaper", "Book", "Patent", "Report"];
const statusClass = (status) => (status || "all").toLowerCase();
const API_BASE_URL = "http://127.0.0.1:8000";

const getFileHref = (fileUrl) => {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${API_BASE_URL}${fileUrl}`;
};

export default function Publications() {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, mine, institutional

  const [form, setForm] = useState({
    title: "",
    type: "Journal",
    status: "Draft",
    abstract: "",
    doi: "",
    visible_to_others: false,
  });

  const [editingPubId, setEditingPubId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    type: "Journal",
    status: "Draft",
    abstract: "",
    doi: "",
    visible_to_others: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploadFiles, setUploadFiles] = useState({});
  const [uploadingPubId, setUploadingPubId] = useState(null);

  const statusCounts = STATUSES.map((status) => ({
    status,
    count: publications.filter((publication) => publication.status === status).length,
  }));

  const refreshPublications = async (status = "") => {
    setLoading(true);
    try {
      const [pubRes, resRes, instRes] = await Promise.all([
        getPublications(status || undefined),
        getResearchers(),
        getInstitutions(),
      ]);
      setPublications(pubRes.data);
      setResearchers(resRes.data);
      setInstitutions(instRes.data);
      setError("");
    } catch {
      setError("Failed to load publications or reference data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    Promise.all([
      getPublications(filterStatus || undefined),
      getResearchers(),
      getInstitutions(),
    ])
      .then(([pubRes, resRes, instRes]) => {
        if (!active) return;
        setPublications(pubRes.data);
        setResearchers(resRes.data);
        setInstitutions(instRes.data);
        setError("");
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load publications or reference data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filterStatus]);

  const handleFormChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleEditFormChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEditForm({ ...editForm, [e.target.name]: val });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        doi: form.doi.trim() === "" ? null : form.doi,
        abstract: form.abstract.trim() === "" ? null : form.abstract,
      };
      await createPublication(payload);
      setForm({ title: "", type: "Journal", status: "Draft", abstract: "", doi: "", visible_to_others: false });
      await refreshPublications(filterStatus);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create publication");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (pub) => {
    setEditingPubId(pub.id);
    setEditForm({
      title: pub.title || "",
      type: pub.type || "Journal",
      status: pub.status || "Draft",
      abstract: pub.abstract || "",
      doi: pub.doi || "",
      visible_to_others: pub.visible_to_others || false,
    });
  };

  const handleCancelEdit = () => {
    setEditingPubId(null);
    setEditForm({
      title: "",
      type: "Journal",
      status: "Draft",
      abstract: "",
      doi: "",
      visible_to_others: false,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const payload = {
        ...editForm,
        doi: editForm.doi.trim() === "" ? null : editForm.doi,
        abstract: editForm.abstract.trim() === "" ? null : editForm.abstract,
      };
      await updatePublication(id, payload);
      setEditingPubId(null);
      await refreshPublications(filterStatus);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save publication updates.");
    }
  };

  const handleToggleVisibility = async (pub) => {
    try {
      await updatePublication(pub.id, {
        visible_to_others: !pub.visible_to_others,
      });
      await refreshPublications(filterStatus);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to toggle publication visibility.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updatePublicationStatus(id, newStatus);
      await refreshPublications(filterStatus);
    } catch {
      setError("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this publication?")) return;
    try {
      await deletePublication(id);
      await refreshPublications(filterStatus);
    } catch {
      setError("Failed to delete publication");
    }
  };

  const handleUploadFileChange = (publicationId, file) => {
    setUploadFiles({
      ...uploadFiles,
      [publicationId]: file,
    });
  };

  const handleFileUpload = async (e, publicationId) => {
    e.preventDefault();
    const file = uploadFiles[publicationId];

    if (!file) {
      alert("Please choose a PDF, DOC, DOCX, or TXT file to upload.");
      return;
    }

    setUploadingPubId(publicationId);
    setError("");

    try {
      await uploadPublicationFile(publicationId, file);
      setUploadFiles({
        ...uploadFiles,
        [publicationId]: null,
      });
      await refreshPublications(filterStatus);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload publication file.");
    } finally {
      setUploadingPubId(null);
    }
  };

  const getResearcherName = (id) => {
    const res = researchers.find((r) => r.id === id);
    return res ? res.full_name : `Researcher #${id}`;
  };

  const getAuthorNames = (pub) => {
    if (!pub.authors || pub.authors.length === 0) return "No authors listed";
    return pub.authors.map((a) => getResearcherName(a.researcher_id)).join(", ");
  };

  const currentUserResearcher = researchers.find((r) => r.user_id === user?.id);
  const currentUserResearcherId = currentUserResearcher?.id;
  const currentUserInstitutionId = currentUserResearcher?.institution_id || (user?.role === "InstitutionAdmin" ? institutions[0]?.id : null);

  const canManagePublication = (pub) => {
    if (user?.role === "SystemAdmin") return true;
    if (pub.uploaded_by === user?.id) return true;

    if (user?.role === "InstitutionAdmin") {
      const uploaderRes = researchers.find((r) => r.user_id === pub.uploaded_by);
      if (uploaderRes && uploaderRes.institution_id === currentUserInstitutionId) return true;
    }

    const isCoAuthor = pub.authors?.some((a) => a.researcher_id === currentUserResearcherId);
    return isCoAuthor;
  };

  const filteredPublications = publications.filter((pub) => {
    if (activeTab === "mine") {
      const isUploader = pub.uploaded_by === user?.id;
      const isCoAuthor = pub.authors?.some((a) => a.researcher_id === currentUserResearcherId);
      return isUploader || isCoAuthor;
    }
    if (activeTab === "institutional") {
      const uploaderRes = researchers.find((r) => r.user_id === pub.uploaded_by);
      return uploaderRes?.institution_id === currentUserInstitutionId;
    }
    return true;
  });

  return (
    <AppShell>
      <main className="publications-page">
        <header className="publications-header">
          <div>
            <p className="dashboard-badge">Publication repository</p>
            <h1 className="publications-title">Publication Management</h1>
            <p className="publications-subtitle">
              Track journal papers, conference papers, books, patents, technical reports, DOI records, and publication status history.
            </p>
          </div>
        </header>

        <section className="publication-summary" aria-label="Publication status summary">
          <div className="publication-summary-card">
            <span>Total records</span>
            <strong>{publications.length}</strong>
          </div>
          {statusCounts.map(({ status, count }) => (
            <div className={`publication-summary-card publication-summary-card--${statusClass(status)}`} key={status}>
              <span>{status}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </section>

        {/* Dynamic Navigation Tabs */}
        <nav className="publications-tabs" aria-label="Publication groups">
          <button
            onClick={() => setActiveTab("all")}
            className={`publications-tab-btn ${activeTab === "all" ? "publications-tab-btn--active" : ""}`}
          >
            All Publications
          </button>
          <button
            onClick={() => setActiveTab("mine")}
            className={`publications-tab-btn ${activeTab === "mine" ? "publications-tab-btn--active" : ""}`}
          >
            My Publications
          </button>
          {currentUserInstitutionId && (
            <button
              onClick={() => setActiveTab("institutional")}
              className={`publications-tab-btn ${activeTab === "institutional" ? "publications-tab-btn--active" : ""}`}
            >
              Institutional Publications
            </button>
          )}
        </nav>

        {/* Add Publication Form */}
        <form onSubmit={handleCreate} className="publication-form">
          <div className="publication-form-header">
            <div>
              <p className="pub-section-label">New record</p>
              <h2>Add publication</h2>
            </div>
          </div>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleFormChange}
            required
            className="pub-input"
          />
          <div className="pub-row">
            <select name="type" value={form.type} onChange={handleFormChange} className="pub-input">
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              name="status"
              value={form.status}
              onChange={handleFormChange}
              className={`pub-input pub-status-control pub-status-control--${statusClass(form.status)}`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <input
            name="doi"
            placeholder="DOI (optional)"
            value={form.doi}
            onChange={handleFormChange}
            className="pub-input"
          />
          <textarea
            name="abstract"
            placeholder="Abstract"
            value={form.abstract}
            onChange={handleFormChange}
            className="pub-input"
            rows={3}
          />
          
          <label className="pub-checkbox-container">
            <input
              type="checkbox"
              name="visible_to_others"
              checked={form.visible_to_others}
              onChange={handleFormChange}
            />
            <span>Visible to others (Public Record)</span>
          </label>

          {error && <p className="pub-error">{error}</p>}
          <button type="submit" disabled={submitting} className="pub-button">
            {submitting ? "Creating..." : "Create publication"}
          </button>
        </form>

        <div className="pub-filter">
          <label>
            <span>Status Filter</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`pub-status-control pub-status-control--${statusClass(filterStatus)}`}
            >
              <option value="">All publications</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="pub-loading">Loading publications...</p>
        ) : (
          <div className="publication-list">
            {filteredPublications.length === 0 && (
              <p className="pub-empty">No publications found in this tab.</p>
            )}
            {filteredPublications.map((pub) => {
              const editable = canManagePublication(pub);
              const isEditing = editingPubId === pub.id;

              return (
                <div key={pub.id} className="publication-card">
                  {isEditing ? (
                    /* Inline Edit Mode */
                    <div className="pub-edit-form">
                      <h3 style={{ marginBottom: "14px" }}>Edit Publication Details</h3>
                      <div className="pub-edit-fields">
                        <input
                          name="title"
                          value={editForm.title}
                          onChange={handleEditFormChange}
                          required
                          className="pub-input"
                          placeholder="Title"
                        />
                        <div className="pub-row">
                          <select
                            name="type"
                            value={editForm.type}
                            onChange={handleEditFormChange}
                            className="pub-input"
                          >
                            {TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditFormChange}
                            className="pub-input"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <input
                          name="doi"
                          value={editForm.doi}
                          onChange={handleEditFormChange}
                          className="pub-input"
                          placeholder="DOI (optional)"
                        />
                        <textarea
                          name="abstract"
                          value={editForm.abstract}
                          onChange={handleEditFormChange}
                          className="pub-input"
                          placeholder="Abstract"
                          rows={3}
                        />
                        <label className="pub-checkbox-container">
                          <input
                            type="checkbox"
                            name="visible_to_others"
                            checked={editForm.visible_to_others}
                            onChange={handleEditFormChange}
                          />
                          <span>Visible to others (Public Record)</span>
                        </label>
                      </div>

                      <div className="proj-edit-actions">
                        <button
                          onClick={() => handleSaveEdit(pub.id)}
                          className="proj-action-btn proj-save-btn"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="proj-action-btn proj-cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <>
                      <div className="pub-card-header">
                        <div>
                          <div className="pub-badge-row">
                            <span className={`pub-badge ${pub.visible_to_others ? "pub-badge--public" : "pub-badge--private"}`}>
                              {pub.visible_to_others ? "🌐 Public" : "🔒 Private"}
                            </span>
                            <span className={`pub-badge pub-badge--${pub.status?.toLowerCase()}`}>
                              {pub.status}
                            </span>
                          </div>
                          <h3 style={{ marginTop: "8px" }}>{pub.title}</h3>
                        </div>
                      </div>

                      <p className="pub-meta">
                        Type: <strong>{pub.type}</strong> {pub.doi && <>| DOI: <strong>{pub.doi}</strong></>}
                      </p>
                      
                      <p className="pub-meta" style={{ marginTop: "-8px", color: "var(--text)" }}>
                        Authors: <strong>{getAuthorNames(pub)}</strong>
                      </p>

                      {pub.abstract && <p className="pub-abstract">{pub.abstract}</p>}

                      <div className="pub-file-panel">
                        <div>
                          <span className="pub-file-label">Attached file</span>
                          {pub.file_url ? (
                            <a href={getFileHref(pub.file_url)} target="_blank" rel="noopener noreferrer">
                              Open document
                            </a>
                          ) : (
                            <strong>No file uploaded</strong>
                          )}
                        </div>

                        {editable && (
                          <form onSubmit={(e) => handleFileUpload(e, pub.id)} className="pub-upload-form">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                              onChange={(e) => handleUploadFileChange(pub.id, e.target.files?.[0] || null)}
                              className="pub-file-input"
                            />
                            <button
                              type="submit"
                              disabled={uploadingPubId === pub.id}
                              className="pub-upload-btn"
                            >
                              {uploadingPubId === pub.id ? "Uploading..." : pub.file_url ? "Replace File" : "Upload File"}
                            </button>
                          </form>
                        )}
                      </div>

                      {/* Actions */}
                      {editable && (
                        <div className="pub-actions">
                          <select
                            value={pub.status}
                            onChange={(e) => handleStatusChange(pub.id, e.target.value)}
                            className={`pub-status-select pub-status-control pub-status-control--${statusClass(pub.status)}`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleStartEdit(pub)}
                            className="pub-edit-btn"
                          >
                            ✏️ Edit Details
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(pub)}
                            className="pub-edit-btn"
                          >
                            {pub.visible_to_others ? "🔒 Make Private" : "🌐 Make Public"}
                          </button>
                          <button
                            onClick={() => handleDelete(pub.id)}
                            className="pub-delete-btn"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </AppShell>
  );
}
