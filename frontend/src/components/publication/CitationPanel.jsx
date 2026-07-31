import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  addCitation,
  fetchCitations,
  deleteCitation,
} from "../../services/citationService";

const emptyForm = {
  cited_title: "",
  cited_authors: "",
  cited_year: "",
  cited_source: "",
  cited_doi: "",
  cited_url: "",
};

function CitationPanel({ publicationId, canEdit }) {
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCitations();
  }, [publicationId]);

  const loadCitations = async () => {
    try {
      setLoading(true);
      const data = await fetchCitations(publicationId);
      setCitations(data);
    } catch (err) {
      // silent — non-critical
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addCitation(publicationId, {
        ...form,
        cited_year: form.cited_year ? Number(form.cited_year) : null,
      });
      toast.success("Citation added.");
      setForm(emptyForm);
      setShowForm(false);
      await loadCitations();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not add citation.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this citation?");
    if (!confirmed) return;
    try {
      await deleteCitation(id);
      toast.success("Citation deleted.");
      await loadCitations();
    } catch (err) {
      toast.error("Could not delete citation.");
    }
  };

  return (
    <div className="citation-panel">
      <div className="citation-panel-header">
        <span className="citation-count-badge">{citations.length} citation{citations.length !== 1 ? "s" : ""}</span>
        {canEdit && (
          <button type="button" className="btn-ghost-outline btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add citation"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="citation-form">
          <input
            name="cited_title"
            placeholder="Title of cited work"
            value={form.cited_title}
            onChange={handleChange}
            required
          />
          <div className="citation-form-grid">
            <input name="cited_authors" placeholder="Authors" value={form.cited_authors} onChange={handleChange} />
            <input name="cited_year" placeholder="Year" type="number" value={form.cited_year} onChange={handleChange} />
          </div>
          <div className="citation-form-grid">
            <input name="cited_source" placeholder="Journal / Conference name" value={form.cited_source} onChange={handleChange} />
            <input name="cited_doi" placeholder="DOI" value={form.cited_doi} onChange={handleChange} />
          </div>
          <input name="cited_url" placeholder="URL (optional)" value={form.cited_url} onChange={handleChange} />
          <button type="submit" className="btn-primary btn-sm" disabled={saving}>
            {saving ? "Saving..." : "Save citation"}
          </button>
        </form>
      )}

      {!loading && citations.length > 0 && (
        <div className="citation-list">
          {citations.map((c) => (
            <div className="citation-item" key={c.id}>
              <div>
                <strong>{c.cited_title}</strong>
                <div className="citation-meta">
                  {c.cited_authors && <span>{c.cited_authors}</span>}
                  {c.cited_year && <span>({c.cited_year})</span>}
                  {c.cited_source && <span>{c.cited_source}</span>}
                </div>
                {c.cited_url && (
                  <a href={c.cited_url} target="_blank" rel="noreferrer" className="citation-link">Link</a>
                )}
              </div>
              {canEdit && (
                <button type="button" className="btn-text-danger" onClick={() => handleDelete(c.id)}>Delete</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CitationPanel;