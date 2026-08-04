import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import {
  createInstitution,
  deleteInstitution,
  getInstitutions,
  updateInstitution,
} from "../api/institutions";
import "./Institutions.css";

const EMPTY_FORM = {
  name: "",
  type: "",
  address: "",
  website: "",
};

const normalizeOptional = (value) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const buildPayload = (form) => ({
  name: form.name.trim(),
  type: normalizeOptional(form.type),
  address: normalizeOptional(form.address),
  website: normalizeOptional(form.website),
});

const formatWebsite = (website) => {
  if (!website) return "";
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
};

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingInstitutionId, setEditingInstitutionId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const typeSummary = useMemo(() => {
    const counts = institutions.reduce((acc, institution) => {
      const type = institution.type || "Unspecified";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 4);
  }, [institutions]);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const response = await getInstitutions();
      setInstitutions(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load institutions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getInstitutions()
      .then((response) => {
        if (!active) return;
        setInstitutions(response.data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.detail || "Failed to load institutions.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createInstitution(buildPayload(form));
      setForm(EMPTY_FORM);
      await loadInstitutions();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create institution.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (institution) => {
    setEditingInstitutionId(institution.id);
    setEditForm({
      name: institution.name || "",
      type: institution.type || "",
      address: institution.address || "",
      website: institution.website || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingInstitutionId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateInstitution(id, buildPayload(editForm));
      setEditingInstitutionId(null);
      setEditForm(EMPTY_FORM);
      await loadInstitutions();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save institution updates.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this institution?")) return;

    try {
      await deleteInstitution(id);
      await loadInstitutions();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete institution.");
    }
  };

  return (
    <AppShell>
      <main className="institutions-page">
        <header className="institutions-header">
          <div>
            <p className="dashboard-badge">Research Directory</p>
            <h1 className="institutions-title">Institution Management</h1>
            <p className="institutions-subtitle">
              Maintain universities, labs, institutes, and partner organizations that anchor researchers,
              departments, projects, and collaborations across the network.
            </p>
          </div>
        </header>

        <section className="institution-summary" aria-label="Institution summary">
          <div className="institution-summary-card">
            <span>Total institutions</span>
            <strong>{institutions.length}</strong>
          </div>
          {typeSummary.map(([type, count]) => (
            <div className="institution-summary-card" key={type}>
              <span>{type}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </section>

        <form onSubmit={handleCreate} className="institution-form">
          <div className="institution-form-header">
            <p className="pub-section-label">New institution</p>
            <h2>Add Institution</h2>
          </div>

          <div className="institution-row">
            <input
              name="name"
              placeholder="Institution name"
              value={form.name}
              onChange={handleFormChange}
              required
              className="institution-input"
            />
            <input
              name="type"
              placeholder="Type (University, Research Lab, Industry Partner)"
              value={form.type}
              onChange={handleFormChange}
              className="institution-input"
            />
          </div>

          <textarea
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleFormChange}
            className="institution-input"
            rows={3}
          />

          <input
            name="website"
            placeholder="Website URL"
            value={form.website}
            onChange={handleFormChange}
            className="institution-input"
          />

          {error && <p className="pub-error">{error}</p>}
          <button type="submit" disabled={submitting} className="institution-button">
            {submitting ? "Adding..." : "Add Institution"}
          </button>
        </form>

        {loading ? (
          <p className="pub-loading">Loading institutions...</p>
        ) : (
          <div className="institution-list">
            {institutions.length === 0 && (
              <p className="pub-empty">No institutions registered yet.</p>
            )}

            {institutions.map((institution) => {
              const isEditing = editingInstitutionId === institution.id;
              const websiteHref = formatWebsite(institution.website);

              return (
                <article key={institution.id} className="institution-card">
                  {isEditing ? (
                    <div className="institution-edit-form">
                      <div className="institution-card-header">
                        <div>
                          <p className="pub-section-label">Edit record</p>
                          <h3>Institution Details</h3>
                        </div>
                      </div>

                      <div className="institution-edit-fields">
                        <div className="institution-row">
                          <input
                            name="name"
                            placeholder="Institution name"
                            value={editForm.name}
                            onChange={handleEditFormChange}
                            required
                            className="institution-input"
                          />
                          <input
                            name="type"
                            placeholder="Type"
                            value={editForm.type}
                            onChange={handleEditFormChange}
                            className="institution-input"
                          />
                        </div>
                        <textarea
                          name="address"
                          placeholder="Address"
                          value={editForm.address}
                          onChange={handleEditFormChange}
                          className="institution-input"
                          rows={3}
                        />
                        <input
                          name="website"
                          placeholder="Website URL"
                          value={editForm.website}
                          onChange={handleEditFormChange}
                          className="institution-input"
                        />
                      </div>

                      <div className="institution-actions">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(institution.id)}
                          className="institution-save-btn"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="institution-cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="institution-card-header">
                        <div>
                          <span className="institution-type">
                            {institution.type || "Unspecified"}
                          </span>
                          <h3>{institution.name}</h3>
                        </div>
                        <span className="institution-id">ID {institution.id}</span>
                      </div>

                      <div className="institution-details">
                        <p>
                          <span>Address</span>
                          <strong>{institution.address || "No address recorded"}</strong>
                        </p>
                        <p>
                          <span>Website</span>
                          {institution.website ? (
                            <a href={websiteHref} target="_blank" rel="noopener noreferrer">
                              {institution.website}
                            </a>
                          ) : (
                            <strong>No website recorded</strong>
                          )}
                        </p>
                      </div>

                      <div className="institution-actions">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(institution)}
                          className="institution-edit-btn"
                        >
                          Edit Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(institution.id)}
                          className="institution-delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </AppShell>
  );
}
