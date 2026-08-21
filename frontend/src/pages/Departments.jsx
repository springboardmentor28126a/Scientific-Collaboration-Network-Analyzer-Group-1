import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  X,
  Layers3,
  Building2,
  Pencil,
  Trash2,
  Search,
  Save,
  CircleAlert,
} from "lucide-react";

import AppShell from "../components/AppShell";
import axiosClient from "../api/axios";

import "./Departments.css";


/* =========================================================
   EMPTY FORM
   ========================================================= */

const EMPTY_FORM = {
  institution_id: "",
  name: "",
  description: "",
};


/* =========================================================
   DEPARTMENTS PAGE
   ========================================================= */

export default function Departments() {

  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [formData, setFormData] =
    useState(EMPTY_FORM);

  const [editFormData, setEditFormData] =
    useState(EMPTY_FORM);

  const [searchTerm, setSearchTerm] =
    useState("");


  /* =========================================================
     LOAD DATA
     ========================================================= */

  const loadData = async () => {

    setLoading(true);
    setError("");

    try {

      const [
        departmentsResponse,
        institutionsResponse,
      ] = await Promise.all([

        axiosClient.get("/departments/"),

        axiosClient.get("/institutions/"),

      ]);


      setDepartments(
        Array.isArray(departmentsResponse.data)
          ? departmentsResponse.data
          : []
      );


      setInstitutions(
        Array.isArray(institutionsResponse.data)
          ? institutionsResponse.data
          : []
      );

    } catch (err) {

      console.error(
        "Department loading error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load departments."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadData();
  }, []);


  /* =========================================================
     HELPERS
     ========================================================= */

  const getInstitutionName = (institutionId) => {

    if (
      institutionId === null ||
      institutionId === undefined ||
      institutionId === ""
    ) {
      return "Institution not assigned";
    }


    const institution =
      institutions.find(
        (item) =>
          Number(item.id) ===
          Number(institutionId)
      );


    return (
      institution?.name ||
      "Institution not found"
    );
  };


  const getDepartmentInstitutionId = (department) => {

    if (
      department?.institution_id !==
      undefined
    ) {
      return department.institution_id;
    }

    if (
      department?.institution?.id !==
      undefined
    ) {
      return department.institution.id;
    }

    return "";
  };


  /* =========================================================
     FORM HANDLERS
     ========================================================= */

  const handleFormChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleEditFormChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setEditFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =========================================================
     CREATE DEPARTMENT
     ========================================================= */

  const handleCreate = async (e) => {

    e.preventDefault();

    setSaving(true);
    setError("");


    try {

      const payload = {
        name:
          String(formData.name || "")
            .trim(),

        description:
          String(formData.description || "")
            .trim() || null,

        institution_id:
          formData.institution_id
            ? Number(formData.institution_id)
            : null,
      };


      if (!payload.name) {

        setError(
          "Department name is required."
        );

        setSaving(false);

        return;
      }


      await axiosClient.post(
        "/departments/",
        payload
      );


      setFormData(EMPTY_FORM);

      setShowAddForm(false);

      await loadData();

    } catch (err) {

      console.error(
        "Create department error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to create department."
      );

    } finally {

      setSaving(false);

    }
  };


  /* =========================================================
     START EDIT
     ========================================================= */

  const startEdit = (department) => {

    const institutionId =
      getDepartmentInstitutionId(
        department
      );


    setEditingId(department.id);


    setEditFormData({

      name:
        department.name || "",

      description:
        department.description || "",

      institution_id:
        institutionId !== null &&
        institutionId !== undefined
          ? String(institutionId)
          : "",

    });


    setError("");

    /*
      IMPORTANT:
      We intentionally do NOT use window.scrollTo().
      Editing happens directly inside the department card.
    */
  };


  /* =========================================================
     CANCEL EDIT
     ========================================================= */

  const cancelEdit = () => {

    setEditingId(null);

    setEditFormData(EMPTY_FORM);

    setError("");
  };


  /* =========================================================
     SAVE EDIT
     ========================================================= */

  const saveEdit = async (departmentId) => {

    setSaving(true);
    setError("");


    try {

      const payload = {
        name:
          String(
            editFormData.name || ""
          ).trim(),

        description:
          String(
            editFormData.description || ""
          ).trim() || null,

        institution_id:
          editFormData.institution_id
            ? Number(
                editFormData.institution_id
              )
            : null,
      };


      if (!payload.name) {

        setError(
          "Department name is required."
        );

        setSaving(false);

        return;
      }


      await axiosClient.put(
        `/departments/${departmentId}`,
        payload
      );


      setEditingId(null);

      setEditFormData(EMPTY_FORM);

      await loadData();

    } catch (err) {

      console.error(
        "Update department error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to update department."
      );

    } finally {

      setSaving(false);

    }
  };


  /* =========================================================
     DELETE
     ========================================================= */

  const handleDelete = async (departmentId) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this department?"
      );


    if (!confirmed) {
      return;
    }


    setError("");


    try {

      await axiosClient.delete(
        `/departments/${departmentId}`
      );


      if (
        Number(editingId) ===
        Number(departmentId)
      ) {
        cancelEdit();
      }


      await loadData();

    } catch (err) {

      console.error(
        "Delete department error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to delete department."
      );
    }
  };


  /* =========================================================
     FILTER
     ========================================================= */

  const filteredDepartments = useMemo(() => {

    const query =
      searchTerm
        .trim()
        .toLowerCase();


    if (!query) {
      return departments;
    }


    return departments.filter(
      (department) => {

        const institutionName =
          getInstitutionName(
            getDepartmentInstitutionId(
              department
            )
          );


        const searchableText = `
          ${department.name || ""}
          ${department.description || ""}
          ${institutionName}
        `.toLowerCase();


        return searchableText.includes(
          query
        );
      }
    );

  }, [
    departments,
    institutions,
    searchTerm,
  ]);


  /* =========================================================
     STATS
     ========================================================= */

  const totalDepartments =
    departments.length;


  const departmentsWithInstitution =
    departments.filter(
      (department) =>
        getDepartmentInstitutionId(
          department
        )
    ).length;


  /* =========================================================
     FORM
     ========================================================= */

  const renderForm = (
    values,
    changeHandler
  ) => {

    return (
      <div className="department-form-grid">

        {/* NAME */}

        <div className="department-form-field">

          <label>
            Department Name
          </label>

          <input
            type="text"
            name="name"
            value={values.name}
            onChange={changeHandler}
            placeholder="e.g. Computer Science and Engineering"
            required
          />

        </div>


        {/* INSTITUTION */}

        <div className="department-form-field">

          <label>
            Institution
          </label>

          <select
            name="institution_id"
            value={
              values.institution_id
            }
            onChange={changeHandler}
          >

            <option value="">
              Select Institution
            </option>


            {institutions.map(
              (institution) => (

                <option
                  key={institution.id}
                  value={institution.id}
                >
                  {institution.name}
                </option>

              )
            )}

          </select>

        </div>


        {/* DESCRIPTION */}

        <div className="department-form-field department-form-field--wide">

          <label>
            Description
          </label>

          <textarea
            name="description"
            value={
              values.description
            }
            onChange={changeHandler}
            rows={4}
            placeholder="Write a short description of the department..."
          />

        </div>

      </div>
    );
  };


  /* =========================================================
     JSX
     ========================================================= */

  return (
    <AppShell>

      <main className="departments-page">


        {/* =================================================
           HERO
           ================================================= */}

        <section className="departments-hero">


          <div className="departments-hero-content">

            <div className="departments-eyebrow">

              <span className="departments-badge">
                Academic Structure
              </span>

              <span className="departments-context">
                Department Management
              </span>

            </div>


            <p className="departments-kicker">
              DEPARTMENT MANAGEMENT
            </p>


            <h1>
              Academic{" "}
              <span>Departments</span>
            </h1>


            <p className="departments-description">
              Manage academic departments,
              their institutional affiliations,
              and department information
              within the research collaboration
              network.
            </p>


            {/* ADD BUTTON BELOW HEADING */}

            <div className="departments-hero-actions">

              <button
                type="button"
                className="departments-primary-btn"
                onClick={() => {

                  setShowAddForm(
                    !showAddForm
                  );

                  setError("");

                }}
              >

                {showAddForm ? (
                  <X size={16} />
                ) : (
                  <Plus size={16} />
                )}

                {showAddForm
                  ? "Close Form"
                  : "Add Department"}

              </button>


              <div className="departments-hero-note">

                <Layers3 size={15} />

                {totalDepartments} registered
                departments

              </div>

            </div>

          </div>


          {/* =================================================
             TOTAL DEPARTMENTS BOX
             ================================================= */}

          <div className="departments-hero-panel">

            <div className="department-hero-icon">

              <Layers3 size={22} />

            </div>


            <span>
              DIRECTORY STATUS
            </span>


            <strong>
              {totalDepartments}
            </strong>


            <small>
              Total Departments
            </small>


            <div className="department-hero-divider" />


            <div className="department-hero-row">

              <span>
                Institutional
              </span>

              <b>
                {departmentsWithInstitution}
              </b>

            </div>

          </div>

        </section>


        {/* =================================================
           ERROR
           ================================================= */}

        {error && !showAddForm && (
          <div className="department-error">

            <CircleAlert size={16} />

            <span>
              {error}
            </span>

          </div>
        )}


        {/* =================================================
           ADD DEPARTMENT FORM
           ================================================= */}

        {showAddForm && (

          <section className="department-create-panel">


            <div className="department-create-header">

              <div>

                <span className="department-section-label">
                  NEW DEPARTMENT
                </span>

                <h2>
                  Add Department
                </h2>

                <p>
                  Create an academic department
                  and associate it with an
                  institution.
                </p>

              </div>


              <button
                type="button"
                className="department-close-btn"
                onClick={() => {

                  setShowAddForm(false);

                  setFormData(
                    EMPTY_FORM
                  );

                  setError("");

                }}
              >

                <X size={18} />

              </button>

            </div>


            <form
              onSubmit={handleCreate}
              className="department-form"
            >

              {renderForm(
                formData,
                handleFormChange
              )}


              {error && (

                <div className="department-error">

                  <CircleAlert size={16} />

                  <span>
                    {error}
                  </span>

                </div>

              )}


              <div className="department-form-actions">

                <button
                  type="button"
                  className="department-secondary-btn"
                  onClick={() => {

                    setShowAddForm(false);

                    setFormData(
                      EMPTY_FORM
                    );

                    setError("");

                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="departments-primary-btn"
                  disabled={saving}
                >

                  <Plus size={16} />

                  {saving
                    ? "Creating..."
                    : "Create Department"}

                </button>

              </div>

            </form>

          </section>

        )}


        {/* =================================================
           DIRECTORY
           ================================================= */}

        <section className="departments-section">


          <div className="departments-section-heading">

            <div>

              <span className="department-section-label">
                DEPARTMENT DIRECTORY
              </span>

              <h2>
                {filteredDepartments.length}{" "}
                {filteredDepartments.length === 1
                  ? "Department"
                  : "Departments"}
              </h2>

            </div>


            <span className="department-section-caption">
              Search and manage academic
              departments
            </span>

          </div>


          {/* SEARCH */}

          <div className="departments-toolbar">

            <div className="departments-search">

              <Search size={16} />

              <input
                type="text"
                placeholder="Search departments, institutions, descriptions..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />


              {searchTerm && (

                <button
                  type="button"
                  className="department-clear-search"
                  onClick={() =>
                    setSearchTerm("")
                  }
                >

                  <X size={14} />

                </button>

              )}

            </div>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="department-empty-state">

              <div className="department-loader" />

              <strong>
                Loading departments
              </strong>

              <span>
                Retrieving department
                directory data...
              </span>

            </div>


          ) : filteredDepartments.length === 0 ? (

            <div className="department-empty-state">

              <div className="empty-department-icon">

                <Layers3 size={23} />

              </div>

              <strong>
                No departments found
              </strong>

              <span>
                Try changing your search or
                add a new department.
              </span>

            </div>


          ) : (

            <div className="department-list">


              {filteredDepartments.map(
                (department) => {

                  const isEditing =
                    Number(editingId) ===
                    Number(department.id);


                  /* =================================================
                     EDIT CARD
                     ================================================= */

                  if (isEditing) {

                    return (

                      <article
                        key={department.id}
                        className="department-card department-card--editing"
                      >

                        <div className="department-edit-header">

                          <div>

                            <span className="department-section-label">
                              DEPARTMENT EDITOR
                            </span>

                            <h3>
                              Update Department
                            </h3>

                          </div>


                          <button
                            type="button"
                            className="department-close-btn"
                            onClick={
                              cancelEdit
                            }
                          >

                            <X size={17} />

                          </button>

                        </div>


                        <div className="department-form">

                          {renderForm(
                            editFormData,
                            handleEditFormChange
                          )}


                          {error && (

                            <div className="department-error">

                              <CircleAlert
                                size={16}
                              />

                              <span>
                                {error}
                              </span>

                            </div>

                          )}


                          <div className="department-form-actions">

                            <button
                              type="button"
                              className="department-secondary-btn"
                              onClick={
                                cancelEdit
                              }
                            >
                              Cancel
                            </button>


                            <button
                              type="button"
                              className="departments-primary-btn"
                              disabled={saving}
                              onClick={() =>
                                saveEdit(
                                  department.id
                                )
                              }
                            >

                              <Save size={16} />

                              {saving
                                ? "Saving..."
                                : "Save Changes"}

                            </button>

                          </div>

                        </div>

                      </article>

                    );
                  }


                  /* =================================================
                     NORMAL DEPARTMENT CARD
                     ================================================= */

                  return (

                    <article
                      key={department.id}
                      className="department-card"
                    >


                      <div className="department-card-top">


                        <div className="department-title-area">


                          <div className="department-avatar">

                            <Layers3 size={21} />

                          </div>


                          <div>

                            <span className="department-profile-badge">
                              Department
                            </span>

                            <h3>
                              {department.name}
                            </h3>

                          </div>

                        </div>


                        <div className="department-actions">


                          <button
                            type="button"
                            title="Edit department"
                            onClick={() =>
                              startEdit(
                                department
                              )
                            }
                          >

                            <Pencil size={15} />

                          </button>


                          <button
                            type="button"
                            title="Delete department"
                            className="department-danger-action"
                            onClick={() =>
                              handleDelete(
                                department.id
                              )
                            }
                          >

                            <Trash2 size={15} />

                          </button>


                        </div>

                      </div>


                      {/* INFORMATION */}

                      <div className="department-information">


                        <div className="department-info-item">

                          <Building2 size={15} />

                          <div>

                            <span>
                              Institution
                            </span>

                            <strong>
                              {getInstitutionName(
                                getDepartmentInstitutionId(
                                  department
                                )
                              )}
                            </strong>

                          </div>

                        </div>


                        <div className="department-info-item">

                          <Layers3 size={15} />

                          <div>

                            <span>
                              Department ID
                            </span>

                            <strong>
                              #{department.id}
                            </strong>

                          </div>

                        </div>

                      </div>


                      {/* DESCRIPTION */}

                      {department.description && (

                        <div className="department-description-box">

                          <span>
                            DESCRIPTION
                          </span>

                          <p>
                            {department.description}
                          </p>

                        </div>

                      )}


                      {/* FOOTER */}

                      <div className="department-card-footer">

                        <span>
                          <Building2 size={13} />

                          {getInstitutionName(
                            getDepartmentInstitutionId(
                              department
                            )
                          )}
                        </span>


                        <span>
                          Academic Department
                        </span>

                      </div>


                    </article>

                  );

                }
              )}

            </div>

          )}

        </section>

      </main>

    </AppShell>
  );
}