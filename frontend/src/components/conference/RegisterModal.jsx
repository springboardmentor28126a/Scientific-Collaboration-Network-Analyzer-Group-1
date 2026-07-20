import { useState } from "react";

function RegisterModal({ conference, onRegister, onClose }) {
  const [role, setRole] = useState("ATTENDEE");
  const [presentationTitle, setPresentationTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onRegister({
        role,
        presentation_title: role === "PRESENTER" ? presentationTitle : null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h4 className="fw-bold mb-1">Register for {conference.title}</h4>
        <p className="text-muted mb-3">{conference.venue}{conference.city ? `, ${conference.city}` : ""}</p>

        <form onSubmit={handleSubmit}>
          <label className="form-label">I am attending as</label>
          <select className="form-select mb-3" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="ATTENDEE">Attendee</option>
            <option value="PRESENTER">Presenter</option>
          </select>

          {role === "PRESENTER" && (
            <>
              <label className="form-label">Presentation title</label>
              <input
                className="form-control mb-3"
                value={presentationTitle}
                onChange={(e) => setPresentationTitle(e.target.value)}
                required
              />
            </>
          )}

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Confirm registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterModal;