import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";
import {
  fetchConferences,
  createConference,
  updateConference,
  deleteConference,
  registerForConference,
  fetchConferenceParticipants,
} from "../services/conferenceService";
import RegisterModal from "../components/conference/RegisterModal";

const emptyForm = {
  title: "",
  acronym: "",
  description: "",
  organizer: "",
  venue: "",
  city: "",
  country: "",
  start_date: "",
  end_date: "",
  submission_deadline: "",
  website: "",
  mode: "IN_PERSON",
  meeting_link: "",
  status: "Upcoming",
};

function ConferencesPage() {
  const { auth } = useAuth();
  const isSystemAdmin = auth?.role === "SYSTEM_ADMIN";
  const isInstitutionAdmin = auth?.role === "INSTITUTION_ADMIN";
  const isResearcher = auth?.role === "RESEARCHER";
  const canViewParticipants = isSystemAdmin || isInstitutionAdmin;

  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [registeringFor, setRegisteringFor] = useState(null);
  const [viewingParticipantsFor, setViewingParticipantsFor] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    loadConferences();
  }, []);

  const loadConferences = async () => {
    try {
      setLoading(true);
      const data = await fetchConferences();
      setConferences(data);
    } catch (err) {
      toast.error("Unable to load conferences.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      submission_deadline: form.submission_deadline
        ? new Date(form.submission_deadline).toISOString()
        : null,
    };

    try {
      if (editingId) {
        await updateConference(editingId, payload);
        toast.success("Conference updated.");
      } else {
        await createConference(payload);
        toast.success("Conference created.");
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadConferences();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save conference.");
    }
  };

  const handleRegister = async (payload) => {
    try {
      await registerForConference(registeringFor.id, payload);
      toast.success("Registered successfully.");
      setRegisteringFor(null);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not register.");
    }
  };

  const handleEdit = (conf) => {
    setForm({
      title: conf.title || "",
      acronym: conf.acronym || "",
      description: conf.description || "",
      organizer: conf.organizer || "",
      venue: conf.venue || "",
      city: conf.city || "",
      country: conf.country || "",
      start_date: conf.start_date ? conf.start_date.slice(0, 10) : "",
      end_date: conf.end_date ? conf.end_date.slice(0, 10) : "",
      submission_deadline: conf.submission_deadline ? conf.submission_deadline.slice(0, 10) : "",
      website: conf.website || "",
      mode: conf.mode || "IN_PERSON",
      meeting_link: conf.meeting_link || "",
      status: conf.status || "Upcoming",
    });
    setEditingId(conf.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewParticipants = async (conf) => {
    try {
      const data = await fetchConferenceParticipants(conf.id);
      setParticipants(data);
      setViewingParticipantsFor(conf);
    } catch (err) {
      toast.error("Could not load participants.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this conference?");
    if (!confirmed) return;

    try {
      await deleteConference(id);
      toast.success("Conference deleted.");
      await loadConferences();
    } catch (err) {
      toast.error("Could not delete conference.");
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="fw-bold mb-1">Conferences</h4>
              <p className="text-muted mb-0">Browse upcoming and past conferences.</p>
            </div>
            {isSystemAdmin && !showForm && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                + Add Conference
              </button>
            )}
          </div>
        </div>
      </div>

      {isSystemAdmin && showForm && (
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">{editingId ? "Update Conference" : "Add Conference"}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Acronym</label>
                  <input className="form-control" name="acronym" value={form.acronym} onChange={handleChange} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" name="description" value={form.description} onChange={handleChange} />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Organizer</label>
                  <input className="form-control" name="organizer" value={form.organizer} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Venue</label>
                  <input className="form-control" name="venue" value={form.venue} onChange={handleChange} />
                </div>

              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">City</label>
                  <input className="form-control" name="city" value={form.city} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Country</label>
                  <input className="form-control" name="country" value={form.country} onChange={handleChange} />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Start date</label>
                  <input type="date" className="form-control" name="start_date" value={form.start_date} onChange={handleChange} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">End date</label>
                  <input type="date" className="form-control" name="end_date" value={form.end_date} onChange={handleChange} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Submission deadline</label>
                  <input type="date" className="form-control" name="submission_deadline" value={form.submission_deadline} onChange={handleChange} />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Website</label>
                  <input className="form-control" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
                </div>
                <div className="col-md-6 mb-3">
  <label className="form-label">Mode</label>
  <select className="form-select" name="mode" value={form.mode} onChange={handleChange}>
    <option value="IN_PERSON">In-person</option>
    <option value="ONLINE">Online</option>
    <option value="HYBRID">Hybrid</option>
  </select>
</div>
<div className="col-md-6 mb-3">
  <label className="form-label">Meeting link (if online/hybrid)</label>
  <input className="form-control" name="meeting_link" value={form.meeting_link} onChange={handleChange} placeholder="https://zoom.us/..." />
</div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4">
                  {editingId ? "Update Conference" : "Save Conference"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : conferences.length === 0 ? (
            <div className="text-center py-5">
              <h5>No conferences yet</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Venue</th>
                    <th>Dates</th>
                    <th>Status</th>
                    {isResearcher && <th className="text-center">Register</th>}
                    {canViewParticipants && <th className="text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {conferences.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.title}</strong>
                        {c.acronym && <span className="text-muted"> ({c.acronym})</span>}
                      </td>
                      <td>{c.venue}{c.city ? `, ${c.city}` : ""}</td>
                      <td>
  {c.mode === "ONLINE" && c.meeting_link ? (
    <a href={c.meeting_link} target="_blank" rel="noreferrer">Join online</a>
  ) : (
    c.mode?.replace("_", "-") || "In-person"
  )}
</td>
                      <td>
                        {c.start_date && new Date(c.start_date).toLocaleDateString()}
                        {" – "}
                        {c.end_date && new Date(c.end_date).toLocaleDateString()}
                      </td>
                      <td>{c.status}</td>

                      {isResearcher && (
  <td className="text-center">
    {new Date(c.end_date) < new Date() ? (
      <span className="text-muted small">Ended</span>
    ) : (
      <button className="btn btn-outline-primary btn-sm" onClick={() => setRegisteringFor(c)}>
        Register
      </button>
    )}
  </td>
)}

                      {canViewParticipants && (
                        <td className="text-center">
                          <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => handleViewParticipants(c)}>
                            Participants
                          </button>
                          {isSystemAdmin && (
                            <>
                              <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEdit(c)}>Edit</button>
                              <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {registeringFor && (
        <RegisterModal
          conference={registeringFor}
          onRegister={handleRegister}
          onClose={() => setRegisteringFor(null)}
        />
      )}

      {viewingParticipantsFor && (
        <div className="modal-backdrop-custom" onClick={() => setViewingParticipantsFor(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <h4 className="fw-bold mb-3">Participants — {viewingParticipantsFor.title}</h4>
            {participants.length === 0 ? (
              <p className="text-muted">No one has registered yet.</p>
            ) : (
              <table className="table table-sm">
                <thead>
                  <tr><th>Name</th><th>Role</th><th>Presentation</th></tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id}>
                      <td>{p.researcher.first_name} {p.researcher.last_name}</td>
                      <td>{p.role === "PRESENTER" ? "Presenter" : "Attendee"}</td>
                      <td>{p.presentation_title || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary" onClick={() => setViewingParticipantsFor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ConferencesPage;