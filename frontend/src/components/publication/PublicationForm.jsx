import { useState, useEffect } from "react";
import CoauthorPicker from "./CoauthorPicker";
import { fetchConferences } from "../../services/conferenceService";

const emptyForm = {
  title: "",
  publication_type: "JOURNAL_PAPER",
  conference_id: "",
  abstract: "",
  authors_text: "",
  doi: "",
  external_link: "",
  publish_date: "",
};

function PublicationForm({ editingPublication, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [coauthors, setCoauthors] = useState([]);
  const [conferences, setConferences] = useState([]);

  useEffect(() => {
    fetchConferences()
      .then(setConferences)
      .catch(() => setConferences([]));
  }, []);

  useEffect(() => {
    if (editingPublication) {
      setForm({
        title: editingPublication.title || "",
        publication_type: editingPublication.publication_type || "JOURNAL_PAPER",
        conference_id: editingPublication.conference_id || "",
        abstract: editingPublication.abstract || "",
        authors_text: editingPublication.authors_text || "",
        doi: editingPublication.doi || "",
        external_link: editingPublication.external_link || "",
        publish_date: editingPublication.publish_date
          ? editingPublication.publish_date.slice(0, 10)
          : "",
      });
      setCoauthors(editingPublication.coauthors || []);
    } else {
      setForm(emptyForm);
      setCoauthors([]);
    }
  }, [editingPublication]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      conference_id: form.conference_id ? Number(form.conference_id) : null,
      publish_date: form.publish_date ? new Date(form.publish_date).toISOString() : null,
      coauthor_researcher_ids: coauthors.map((c) => c.id),
    };
    await onSave(payload);
    setForm(emptyForm);
    setCoauthors([]);
  };

  const isConferencePaper = form.publication_type === "CONFERENCE_PAPER";

  return (
    <div className="pub-card">
      <h3>{editingPublication ? "Edit publication" : "Add a publication"}</h3>

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Publication type</label>
        <select name="publication_type" value={form.publication_type} onChange={handleChange}>
          <option value="JOURNAL_PAPER">Journal Paper</option>
          <option value="CONFERENCE_PAPER">Conference Paper</option>
          <option value="BOOK">Book</option>
          <option value="PATENT">Patent</option>
          <option value="TECHNICAL_REPORT">Technical Report</option>
        </select>

        {isConferencePaper && (
          <>
            <label>Conference</label>
            <select name="conference_id" value={form.conference_id} onChange={handleChange}>
              <option value="">Select conference (optional)</option>
              {conferences.map((c) => (
                <option key={c.id} value={c.id}>{c.title} {c.acronym ? `(${c.acronym})` : ""}</option>
              ))}
            </select>
          </>
        )}

        <label>Abstract</label>
        <textarea name="abstract" rows="3" value={form.abstract} onChange={handleChange} />

        <label>Co-authors on this platform (search and select)</label>
        <CoauthorPicker selectedCoauthors={coauthors} onChange={setCoauthors} />

        <label>External co-authors (free text, e.g. authors not on this platform)</label>
        <input name="authors_text" value={form.authors_text} onChange={handleChange} />

        <div className="pub-form-grid">
          <div>
            <label>DOI</label>
            <input name="doi" value={form.doi} onChange={handleChange} placeholder="10.1000/xyz123" />
          </div>
          <div>
            <label>Publish date</label>
            <input type="date" name="publish_date" value={form.publish_date} onChange={handleChange} />
          </div>
        </div>

        <label>External link</label>
        <input name="external_link" value={form.external_link} onChange={handleChange} placeholder="https://..." />

        <div className="pub-form-actions">
          {editingPublication && (
            <button type="button" className="btn-ghost-outline" onClick={onCancel}>Cancel</button>
          )}
          <button type="submit" className="btn-primary">
            {editingPublication ? "Save changes" : "Add publication"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PublicationForm;