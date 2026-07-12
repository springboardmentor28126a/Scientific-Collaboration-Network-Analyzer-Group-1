import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

function DepartmentForm({
  department,
  institutions,
  onSubmit,
  onCancel,
  isEditing,
}) {
  const { auth } = useAuth();
  const isInstitutionAdmin = auth?.role === "INSTITUTION_ADMIN";

  const [formData, setFormData] = useState(department);

  useEffect(() => {
    if (isInstitutionAdmin && !isEditing) {
      setFormData({ ...department, institution_id: auth.institution_id });
    } else {
      setFormData(department);
    }
  }, [department]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);
  };

  const currentInstitutionName = institutions.find(
    (i) => i.id === Number(formData.institution_id)
  )?.institution_name;

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <h4 className="fw-bold mb-4">
            {isEditing ? "Update Department" : "Add Department"}
          </h4>

          <h5 className="text-primary fw-bold mb-3">Department Information</h5>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Institution</label>

              {isInstitutionAdmin ? (
                <input
                  type="text"
                  className="form-control"
                  value={currentInstitutionName || "Your institution"}
                  disabled
                  readOnly
                />
              ) : (
                <select
                  className="form-select"
                  name="institution_id"
                  value={formData.institution_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Institution</option>
                  {institutions.map((institution) => (
                    <option key={institution.id} value={institution.id}>
                      {institution.institution_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Department Name</label>
              <input
                type="text"
                className="form-control"
                name="department_name"
                value={formData.department_name}
                onChange={handleChange}
                placeholder="Computer Science & Engineering"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="4"
              name="description"
              value={formData.description ?? ""}
              onChange={handleChange}
              placeholder="Department description..."
            />
          </div>

          <div className="d-flex justify-content-end">
            {isEditing && (
              <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary px-4">
              {isEditing ? "Update Department" : "Save Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DepartmentForm;