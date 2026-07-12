import { useEffect, useState } from "react";

function ResearcherManagePanel({ researcher, departments, onSave, onClose }) {
  const [departmentId, setDepartmentId] = useState(researcher?.department_id || "");
  const [designation, setDesignation] = useState(researcher?.designation || "");

  useEffect(() => {
    setDepartmentId(researcher?.department_id || "");
    setDesignation(researcher?.designation || "");
  }, [researcher]);

  if (!researcher) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(researcher.id, {
      department_id: Number(departmentId),
      designation,
    });
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4">
      <div className="card-body">
        <h4 className="fw-bold mb-1">
          Manage {researcher.first_name} {researcher.last_name}
        </h4>
        <p className="text-muted mb-4">
          You can update department and designation. Bio, research interests, and skills are
          edited by the researcher themselves.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.department_name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-control"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Assistant Professor, PhD Candidate, etc."
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Qualification (read only)</label>
            <input type="text" className="form-control" value={researcher.qualification || "-"} disabled />
          </div>

          <div className="mb-3">
            <label className="form-label">Biography (read only)</label>
            <textarea className="form-control" rows="3" value={researcher.biography || "-"} disabled />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-4">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResearcherManagePanel;