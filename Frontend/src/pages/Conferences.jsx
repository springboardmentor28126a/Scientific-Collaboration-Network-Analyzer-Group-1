import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { getConferences, createConference, deleteConference, registerConferenceParticipation, removeConferenceParticipation } from "../api/conferences";
import { getResearchers } from "../api/researchers";
import "./Conferences.css";

export default function Conferences() {
  const [conferences, setConferences] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    acronym: "",
    year: new Date().getFullYear(),
    location: "",
    website: "",
    start_date: "",
    end_date: "",
  });

  const [registerForms, setRegisterForms] = useState({}); // { [confId]: { researcher_id: "", role: "Attendee", paper_title: "", presentation_time: "" } }
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [confRes, resRes] = await Promise.all([
        getConferences(),
        getResearchers(),
      ]);
      setConferences(confRes.data);
      setResearchers(resRes.data);
      setError("");
    } catch {
      setError("Failed to load conferences or researcher data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        year: form.year ? parseInt(form.year) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      await createConference(payload);
      setForm({
        name: "",
        acronym: "",
        year: new Date().getFullYear(),
        location: "",
        website: "",
        start_date: "",
        end_date: "",
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create conference");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this conference?")) return;
    try {
      await deleteConference(id);
      await loadData();
    } catch {
      setError("Failed to delete conference");
    }
  };

  const handleRegisterChange = (confId, field, value) => {
    setRegisterForms({
      ...registerForms,
      [confId]: {
        ...registerForms[confId],
        [field]: value,
      },
    });
  };

  const handleRegister = async (e, confId) => {
    e.preventDefault();
    const regForm = registerForms[confId];
    if (!regForm?.researcher_id) {
      alert("Please select a researcher to register.");
      return;
    }
    try {
      await registerConferenceParticipation(confId, {
        researcher_id: parseInt(regForm.researcher_id),
        role: regForm.role || "Attendee",
        paper_title: regForm.paper_title || null,
        presentation_time: regForm.presentation_time ? new Date(regForm.presentation_time).toISOString() : null,
      });
      setRegisterForms({
        ...registerForms,
        [confId]: { researcher_id: "", role: "Attendee", paper_title: "", presentation_time: "" },
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to register participation");
    }
  };

  const handleRemoveParticipation = async (confId, researcherId) => {
    if (!window.confirm("Cancel this conference registration?")) return;
    try {
      await removeConferenceParticipation(confId, researcherId);
      await loadData();
    } catch {
      alert("Failed to cancel registration");
    }
  };

  const getResearcherName = (id) => {
    const res = researchers.find((r) => r.id === id);
    return res ? res.full_name : `Researcher #${id}`;
  };

  return (
    <AppShell>
      <main className="conf-page">
        <header className="conf-header">
          <div>
            <p className="dashboard-badge">Scientific Exchange</p>
            <h1 className="conf-title">Conferences</h1>
            <p className="conf-subtitle">
              Register scientific events, schedule academic presentations, and log participation histories for researchers.
            </p>
          </div>
        </header>

        {/* Add Conference Form */}
        <form onSubmit={handleCreate} className="conf-form">
          <div className="conf-form-header">
            <p className="pub-section-label">New Event</p>
            <h2>Add Conference</h2>
          </div>
          <input
            name="name"
            placeholder="Conference Name (e.g. International Conference on Machine Learning)"
            value={form.name}
            onChange={handleFormChange}
            required
            className="conf-input"
          />
          <div className="conf-row">
            <input
              name="acronym"
              placeholder="Acronym (e.g. ICML)"
              value={form.acronym}
              onChange={handleFormChange}
              className="conf-input"
            />
            <input
              name="year"
              type="number"
              placeholder="Year"
              value={form.year}
              onChange={handleFormChange}
              className="conf-input"
            />
          </div>
          <div className="conf-row">
            <input
              name="location"
              placeholder="Location (e.g. Vancouver, Canada)"
              value={form.location}
              onChange={handleFormChange}
              className="conf-input"
            />
            <input
              name="website"
              placeholder="Website URL"
              value={form.website}
              onChange={handleFormChange}
              className="conf-input"
            />
          </div>
          <div className="conf-row">
            <input
              name="start_date"
              type="date"
              placeholder="Start Date"
              value={form.start_date}
              onChange={handleFormChange}
              className="conf-input"
            />
            <input
              name="end_date"
              type="date"
              placeholder="End Date"
              value={form.end_date}
              onChange={handleFormChange}
              className="conf-input"
            />
          </div>
          {error && <p className="pub-error">{error}</p>}
          <button type="submit" disabled={submitting} className="conf-button">
            {submitting ? "Adding..." : "Add Conference"}
          </button>
        </form>

        {/* Conference List */}
        {loading ? (
          <p className="pub-loading">Loading conferences...</p>
        ) : (
          <div className="conf-list">
            {conferences.length === 0 && <p className="pub-empty">No conferences added yet.</p>}
            {conferences.map((conf) => (
              <div key={conf.id} className="conf-card">
                <h3>{conf.acronym ? `[${conf.acronym}] ` : ""}{conf.name}</h3>
                <p className="conf-meta">
                  Year: {conf.year || "N/A"} | Location: {conf.location || "Online"} | 
                  Timeline: {conf.start_date || "?"} to {conf.end_date || "?"} 
                  {conf.website && (
                    <>
                      {" | "}
                      <a href={conf.website} target="_blank" rel="noopener noreferrer" className="conf-link">
                        Visit Website
                      </a>
                    </>
                  )}
                </p>

                {/* Participations Section */}
                <div className="conf-participations-section">
                  <h4>Attendees & Presenters</h4>
                  <div className="conf-parts-list">
                    {conf.participations.length === 0 ? (
                      <p className="pub-empty" style={{ fontSize: "0.85rem", margin: "0" }}>No participations registered.</p>
                    ) : (
                      conf.participations.map((part) => (
                        <div key={part.id} className="conf-part-row">
                          <div className="conf-part-details">
                            <strong>{getResearcherName(part.researcher_id)}</strong>
                            <span>Role: {part.role}</span>
                            {part.paper_title && (
                              <span style={{ fontStyle: "italic" }}>Paper: {part.paper_title}</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveParticipation(conf.id, part.researcher_id)}
                            className="conf-remove-part-btn"
                          >
                            Cancel Registration
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Register Participation Inline Form */}
                  <form onSubmit={(e) => handleRegister(e, conf.id)} className="conf-register-form">
                    <select
                      value={registerForms[conf.id]?.researcher_id || ""}
                      onChange={(e) => handleRegisterChange(conf.id, "researcher_id", e.target.value)}
                      className="conf-register-input"
                    >
                      <option value="">Register Researcher...</option>
                      {researchers.map((r) => (
                        <option key={r.id} value={r.id}>{r.full_name}</option>
                      ))}
                    </select>
                    <select
                      value={registerForms[conf.id]?.role || "Attendee"}
                      onChange={(e) => handleRegisterChange(conf.id, "role", e.target.value)}
                      className="conf-register-input"
                    >
                      <option value="Attendee">Attendee</option>
                      <option value="Presenter">Presenter</option>
                      <option value="Keynote Speaker">Keynote Speaker</option>
                    </select>
                    <input
                      placeholder="Paper Title (Presenter only)"
                      value={registerForms[conf.id]?.paper_title || ""}
                      onChange={(e) => handleRegisterChange(conf.id, "paper_title", e.target.value)}
                      className="conf-register-input"
                      style={{ flex: "1 1 200px" }}
                    />
                    <button type="submit" className="conf-register-btn">Register</button>
                  </form>
                </div>

                <button onClick={() => handleDelete(conf.id)} className="conf-delete-btn">
                  Delete Conference
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
