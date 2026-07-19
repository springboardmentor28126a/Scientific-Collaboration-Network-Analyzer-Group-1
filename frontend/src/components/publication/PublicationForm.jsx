import { useState, useEffect } from "react";
import CoauthorPicker from "./CoauthorPicker";

const emptyForm = {
  title: "",
  abstract: "",
  authors_text: "",
  doi: "",
  external_link: "",
  publish_date: "",
};

function PublicationForm({ editingPublication, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [coauthors, setCoauthors] = useState([]);

  useEffect(() => {
    if (editingPublication) {
      setForm({
        title: editingPublication.title || "",
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
      publish_date: form.publish_date ? new Date(form.publish_date).toISOString() : null,
      coauthor_researcher_ids: coauthors.map((c) => c.id),
    };
    await onSave(payload);
    setForm(emptyForm);
    setCoauthors([]);
  };

  return (
    <div className="pub-card">
      <h3>{editingPublication ? "Edit publication" : "Add a publication"}</h3>

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

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