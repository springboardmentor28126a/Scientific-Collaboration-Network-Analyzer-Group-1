import { useEffect, useState } from "react";

import { fetchInstitutions } from "../../services/institutionService";
import { fetchDepartments } from "../../services/departmentService";

function ResearcherForm({
  researcher,
  onSubmit,
  onCancel,
  isEditing,
}) {
  // ------------------------------------
  // Dropdown Data
  // ------------------------------------

  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);

  // ------------------------------------
  // Local Form State
  // ------------------------------------

  const [formData, setFormData] = useState(researcher);

  // ------------------------------------
  // Load Dropdown Data
  // ------------------------------------

  useEffect(() => {
    loadInitialData();
  }, []);

  // ------------------------------------
  // Populate form while editing
  // ------------------------------------

  useEffect(() => {
    setFormData(researcher);
  }, [researcher]);

  const loadInitialData = async () => {
    try {
      const [institutionData, departmentData] =
        await Promise.all([
          fetchInstitutions(),
          fetchDepartments(),
        ]);

      setInstitutions(institutionData);
      setDepartments(departmentData);
    } catch (error) {
      console.error(error);
    }
  };

  // ------------------------------------
  // Handle Change
  // ------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ------------------------------------
  // Handle Submit
  // ------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit(formData);
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4">

      <div className="card-body p-4">

        <form onSubmit={handleSubmit}>

          <h3 className="fw-bold text-center mb-5">

            {isEditing
              ? "Update Researcher"
              : "Add Researcher"}

          </h3>

          {/* ===================================== */}
          {/* BASIC INFORMATION */}
          {/* ===================================== */}

          <h5 className="fw-bold text-primary mb-3">
            Basic Information
          </h5>

          <div className="row">

            <div className="col-md-4 mb-3">

              <label className="form-label fw-semibold text-secondary">
                User ID
              </label>

              <input
                type="number"
                className="form-control"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-4 mb-3">

              <label className="form-label fw-semibold text-secondary">
                First Name
              </label>

              <input
                type="text"
                className="form-control"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-4 mb-3">

              <label className="form-label fw-semibold text-secondary">
                Last Name
              </label>

              <input
                type="text"
                className="form-control"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />

            </div>

          </div>

          <hr />

          {/* ===================================== */}
          {/* ACADEMIC INFORMATION */}
          {/* ===================================== */}

          <h5 className="fw-bold text-primary mb-3">
            Academic Information
          </h5>

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label fw-semibold text-secondary">
                Institution
              </label>

              <select
                className="form-select"
                name="institution_id"
                value={formData.institution_id}
                onChange={handleChange}
              >

                <option value="">
                  Select Institution
                </option>

                {institutions.map((institution) => (

                  <option
                    key={institution.id}
                    value={institution.id}
                  >
                    {institution.institution_name}
                  </option>

                ))}

              </select>

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label fw-semibold text-secondary">
                Department
              </label>

              <select
                className="form-select"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
              >

                <option value="">
                  Select Department
                </option>

                {departments.map((department) => (

                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.department_name}
                  </option>

                ))}

              </select>

            </div>

          </div>

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label fw-semibold text-secondary">
                Designation
              </label>

              <input
                className="form-control"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label fw-semibold text-secondary">
                Qualification
              </label>

              <input
                className="form-control"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
              />

            </div>

          </div>

          <hr />

          {/* ===================================== */}
          {/* RESEARCH */}
          {/* ===================================== */}

          <h5 className="fw-bold text-primary mb-3">
            Research Information
          </h5>

          <div className="mb-3">

            <label className="form-label fw-semibold text-secondary">
              Research Interests
            </label>

            <textarea
              rows="3"
              className="form-control"
              name="research_interests"
              value={formData.research_interests}
              onChange={handleChange}
            />

          </div>

          <div className="mb-3">

            <label className="form-label fw-semibold text-secondary">
              Skills
            </label>

            <textarea
              rows="3"
              className="form-control"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
            />

          </div>

          <hr />

          {/* ===================================== */}
          {/* ADDITIONAL */}
          {/* ===================================== */}

          <h5 className="fw-bold text-primary mb-3">
            Additional Information
          </h5>

          <div className="mb-3">

            <label className="form-label fw-semibold text-secondary">
              Biography
            </label>

            <textarea
              rows="4"
              className="form-control"
              name="biography"
              value={formData.biography}
              onChange={handleChange}
            />

          </div>

          <div className="mb-4">

            <label className="form-label fw-semibold text-secondary">
              Profile Image URL
            </label>

            <input
              className="form-control"
              name="profile_image"
              value={formData.profile_image}
              onChange={handleChange}
            />

          </div>

          <div className="d-flex justify-content-end gap-2">

            {isEditing && (

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>

            )}

            <button
              type="submit"
              className={`btn ${
                isEditing
                  ? "btn-warning"
                  : "btn-primary"
              } px-4`}
            >

              {isEditing
                ? "Update Researcher"
                : "Save Researcher"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ResearcherForm;