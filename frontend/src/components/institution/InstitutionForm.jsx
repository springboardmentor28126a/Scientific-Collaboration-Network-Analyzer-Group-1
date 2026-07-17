import { useEffect, useState } from "react";

function InstitutionForm({
  institution,
  onSubmit,
  onCancel,
  isEditing,
}) {

  const [formData, setFormData] =
    useState(institution);

  useEffect(() => {
    setFormData(institution);
  }, [institution]);

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

  return (

    <div className="card shadow-sm border-0 rounded-4 mb-4">

      <div className="card-body">

        <form onSubmit={handleSubmit}>

          <h4 className="fw-bold mb-4">

            {isEditing
              ? "Update Institution"
              : "Add Institution"}

          </h4>

          <h5 className="text-primary fw-bold mb-3">
            Institution Information
          </h5>

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Institution Name
              </label>

              <input
                type="text"
                className="form-control"
                name="institution_name"
                value={formData.institution_name}
                onChange={handleChange}
                required
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Phone
              </label>

              <input
                type="text"
                className="form-control"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Website
              </label>

              <input
                type="text"
                className="form-control"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />

            </div>

          </div>

          <hr className="my-4" />

          <h5 className="text-primary fw-bold mb-3">
            Location Information
          </h5>

          <div className="mb-3">

            <label className="form-label">
              Address
            </label>

            <textarea
              className="form-control"
              rows="3"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />

          </div>

          <div className="row">

            <div className="col-md-4 mb-3">

              <label className="form-label">
                City
              </label>

              <input
                type="text"
                className="form-control"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-4 mb-3">

              <label className="form-label">
                State
              </label>

              <input
                type="text"
                className="form-control"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-4 mb-4">

              <label className="form-label">
                Country
              </label>

              <input
                type="text"
                className="form-control"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="d-flex justify-content-end">

            {isEditing && (

              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={onCancel}
              >
                Cancel
              </button>

            )}

            <button
              type="submit"
              className="btn btn-primary px-4"
            >

              {isEditing
                ? "Update Institution"
                : "Save Institution"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default InstitutionForm;