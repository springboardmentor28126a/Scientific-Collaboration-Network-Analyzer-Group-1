import { useState, useEffect } from "react";

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
    } else {
      setForm(emptyForm);
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
    };
    await onSave(payload);
    setForm(emptyForm);
  };

  return (
    <div className="pub-card">
      <h3>{editingPublication ? "Edit publication" : "Add a publication"}</h3>

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Abstract</label>
        <textarea name="abstract" rows="3" value={form.abstract} onChange={handleChange} />

        <label>Co-authors (free text, e.g. "J. Smith, R. Patel")</label>
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