import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";

import {
  getResearchers,
  createResearcher,
  updateResearcher,
  deleteResearcher,
  getInstitutions,
  getDepartments,
} from "../api/researchers";

import {
  Users,
  Search,
  Plus,
  X,
  Pencil,
  Trash2,
  Building2,
  GraduationCap,
  UserRound,
  Mail,
  BookOpen,
  Code2,
  CircleAlert,
  Check,
} from "lucide-react";

import "./Researchers.css";


/* =========================================================
   EMPTY FORM
   ========================================================= */

const emptyForm = {
  full_name: "",
  institution_id: "",
  department: "",
  bio: "",
  research_interests: "",
  skills: "",
};


/* =========================================================
   RESPONSE HELPER
   ========================================================= */

const getArrayFromResponse = (response) => {

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};


/* =========================================================
   COMPONENT
   ========================================================= */

export default function Researchers() {

  const [researchers, setResearchers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [institutionFilter, setInstitutionFilter] =
    useState("all");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const [editForm, setEditForm] =
    useState(emptyForm);


  /* =========================================================
     LOAD DATA
     ========================================================= */

  const loadData = async () => {

    setLoading(true);
    setError("");

    try {

      const [
        researchersResponse,
        institutionsResponse,
        departmentsResponse,
      ] = await Promise.all([
        getResearchers(),
        getInstitutions(),
        getDepartments(),
      ]);

      const researcherData =
        getArrayFromResponse(
          researchersResponse
        );

      const institutionData =
        getArrayFromResponse(
          institutionsResponse
        );

      const departmentData =
        getArrayFromResponse(
          departmentsResponse
        );

      setResearchers(researcherData);
      setInstitutions(institutionData);
      setDepartments(departmentData);

    } catch (err) {

      console.error(
        "Researcher loading error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to load researcher data."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadData();

  }, []);


  /* =========================================================
     FORM HANDLERS
     ========================================================= */

  const handleFormChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleEditFormChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =========================================================
     CREATE
     ========================================================= */

  const handleCreate = async (e) => {

    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {

      const payload = {

        full_name:
          form.full_name.trim(),

        institution_id:
          form.institution_id
            ? Number(form.institution_id)
            : null,

        department:
          form.department.trim() || null,

        bio:
          form.bio.trim() || null,

        research_interests:
          form.research_interests.trim() ||
          null,

        skills:
          form.skills.trim() || null,
      };


      await createResearcher(payload);


      setForm(emptyForm);

      setShowCreateForm(false);

      await loadData();

    } catch (err) {

      console.error(
        "Create researcher error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to create researcher."
      );

    } finally {

      setSubmitting(false);

    }
  };


  /* =========================================================
     EDIT
     ========================================================= */

  const startEdit = (researcher) => {

    setEditingId(researcher.id);

    setEditForm({

      full_name:
        researcher.full_name || "",

      institution_id:
        researcher.institution_id != null
          ? String(
              researcher.institution_id
            )
          : "",

      department:
        researcher.department || "",

      bio:
        researcher.bio || "",

      research_interests:
        researcher.research_interests || "",

      skills:
        researcher.skills || "",
    });
  };


  const cancelEdit = () => {

    setEditingId(null);

    setEditForm(emptyForm);

    setError("");
  };


  /* =========================================================
     SAVE EDIT
     ========================================================= */

  const saveEdit = async (id) => {

    setSubmitting(true);
    setError("");

    try {

      const payload = {

        full_name:
          editForm.full_name.trim(),

        institution_id:
          editForm.institution_id
            ? Number(
                editForm.institution_id
              )
            : null,

        department:
          editForm.department.trim() || null,

        bio:
          editForm.bio.trim() || null,

        research_interests:
          editForm.research_interests.trim() ||
          null,

        skills:
          editForm.skills.trim() || null,
      };


      await updateResearcher(
        id,
        payload
      );


      setEditingId(null);

      setEditForm(emptyForm);

      await loadData();

    } catch (err) {

      console.error(
        "Update researcher error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to update researcher."
      );

    } finally {

      setSubmitting(false);

    }
  };


  /* =========================================================
     DELETE
     ========================================================= */

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this researcher?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteResearcher(id);

      await loadData();

    } catch (err) {

      console.error(
        "Delete researcher error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to delete researcher."
      );
    }
  };


  /* =========================================================
     INSTITUTION NAME
     ========================================================= */

  const getInstitutionName = (id) => {

    if (
      id === null ||
      id === undefined ||
      id === ""
    ) {
      return "Independent Researcher";
    }

    const institution =
      institutions.find(
        (item) =>
          Number(item.id) ===
          Number(id)
      );

    return (
      institution?.name ||
      "Institution not found"
    );
  };


  /* =========================================================
     DEPARTMENT NAME
     ========================================================= */

  const getDepartmentName = (department) => {

    if (
      !department ||
      !String(department).trim()
    ) {
      return "Department not specified";
    }

    return String(department);
  };


  /* =========================================================
     FILTERING
     ========================================================= */

  const filteredResearchers =
    useMemo(() => {

      return researchers.filter(
        (researcher) => {

          if (
            institutionFilter !== "all" &&
            Number(
              researcher.institution_id
            ) !==
              Number(
                institutionFilter
              )
          ) {
            return false;
          }


          if (search.trim()) {

            const query =
              search.toLowerCase();


            const searchableText = `

              ${researcher.full_name || ""}

              ${researcher.bio || ""}

              ${researcher.research_interests || ""}

              ${researcher.skills || ""}

              ${getInstitutionName(
                researcher.institution_id
              )}

              ${researcher.department || ""}

            `.toLowerCase();


            if (
              !searchableText.includes(
                query
              )
            ) {
              return false;
            }
          }


          return true;
        }
      );

    }, [
      researchers,
      institutions,
      search,
      institutionFilter,
    ]);


  /* =========================================================
     STATS
     ========================================================= */

  const totalResearchers =
    researchers.length;


  const researchersWithInstitution =
    researchers.filter(
      (researcher) =>
        researcher.institution_id
    ).length;


  const researchersWithBiography =
    researchers.filter(
      (researcher) =>
        researcher.bio &&
        researcher.bio.trim()
    ).length;


  const representedDepartments =
    new Set(
      researchers
        .map(
          (researcher) =>
            researcher.department
        )
        .filter(
          (department) =>
            department &&
            department.trim()
        )
    ).size;


  /* =========================================================
     RESEARCHER FORM
     ========================================================= */

  const researcherForm = (
    values,
    changeHandler
  ) => (

    <>

      <div className="researcher-form-grid">


        {/* FULL NAME */}

        <div className="researcher-form-field researcher-form-field--wide">

          <label>
            Full Name
          </label>

          <input
            name="full_name"
            value={values.full_name}
            onChange={changeHandler}
            placeholder="Enter researcher full name"
            required
          />

        </div>


        {/* INSTITUTION */}

        <div className="researcher-form-field">

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

          <small className="researcher-field-help">
            Select the researcher's affiliated institution.
          </small>

        </div>


        {/* DEPARTMENT */}

        <div className="researcher-form-field">

          <label>
            Department
          </label>

          <select
            name="department"
            value={
              values.department
            }
            onChange={changeHandler}
          >

            <option value="">
              Select Department
            </option>

            {departments.map(
              (department) => (

                <option
                  key={department.id}
                  value={department.name}
                >
                  {department.name}
                </option>

              )
            )}

          </select>

          <small className="researcher-field-help">
            Select the researcher's department.
          </small>

        </div>


        {/* RESEARCH INTERESTS */}

        <div className="researcher-form-field researcher-form-field--wide">

          <label>
            Research Interests
          </label>

          <input
            name="research_interests"
            value={
              values.research_interests
            }
            onChange={changeHandler}
            placeholder="e.g. Artificial Intelligence, Computer Vision"
          />

        </div>


        {/* SKILLS */}

        <div className="researcher-form-field researcher-form-field--wide">

          <label>
            Skills
          </label>

          <input
            name="skills"
            value={values.skills}
            onChange={changeHandler}
            placeholder="e.g. Python, Machine Learning, React"
          />

        </div>


        {/* BIOGRAPHY */}

        <div className="researcher-form-field researcher-form-field--wide">

          <label>
            Biography
          </label>

          <textarea
            name="bio"
            value={values.bio}
            onChange={changeHandler}
            rows={4}
            placeholder="Write a short professional biography..."
          />

        </div>

      </div>

    </>
  );


  /* =========================================================
     JSX
     ========================================================= */

  return (

    <AppShell>

      <main className="researchers-page">


        {/* HERO */}

        <section className="researchers-hero">

          <div className="researchers-hero-content">

            <div className="researchers-eyebrow">

              <span className="researchers-badge">
                Collaboration Network
              </span>

              <span className="researchers-context">
                Research Directory
              </span>

            </div>


            <p className="researchers-kicker">
              RESEARCHER MANAGEMENT
            </p>


            <h1>
              Researcher{" "}
              <span>Directory</span>
            </h1>


            <p className="researchers-description">
              Manage researcher profiles,
              institutional affiliations,
              departments, research interests,
              skills, and academic information
              from one centralized workspace.
            </p>


            <div className="researchers-hero-actions">

              <button
                className="researchers-primary-btn"
                onClick={() =>
                  setShowCreateForm(true)
                }
              >

                <Plus size={16} />

                Add Researcher

              </button>


              <div className="researchers-hero-note">

                <Users size={15} />

                {totalResearchers} registered
                researchers

              </div>

            </div>

          </div>


          <div className="researchers-hero-panel">

            <div className="researcher-hero-icon">
              <Users size={22} />
            </div>

            <span>
              DIRECTORY STATUS
            </span>

            <strong>
              {totalResearchers} Researchers
            </strong>

            <small>
              profiles currently registered
            </small>

            <div className="researcher-hero-divider" />

            <div className="researcher-hero-row">

              <span>
                Institutional
              </span>

              <b>
                {researchersWithInstitution}
              </b>

            </div>

          </div>

        </section>


        {/* STATS */}

        <section className="researchers-section">

          <div className="researchers-section-heading">

            <div>

              <span className="researcher-section-label">
                RESEARCHER OVERVIEW
              </span>

              <h2>
                Research Community
              </h2>

            </div>

            <span className="researcher-section-caption">
              Current directory metrics
            </span>

          </div>


          <div className="researcher-stats-grid">


            <div className="researcher-stat-card">

              <div className="researcher-stat-icon">
                <Users size={19} />
              </div>

              <div>

                <span>
                  Total Researchers
                </span>

                <strong>
                  {totalResearchers}
                </strong>

                <small>
                  Registered profiles
                </small>

              </div>

            </div>


            <div className="researcher-stat-card">

              <div className="researcher-stat-icon">
                <Building2 size={19} />
              </div>

              <div>

                <span>
                  Institutional
                </span>

                <strong>
                  {researchersWithInstitution}
                </strong>

                <small>
                  Linked to institutions
                </small>

              </div>

            </div>


            <div className="researcher-stat-card">

              <div className="researcher-stat-icon">
                <GraduationCap size={19} />
              </div>

              <div>

                <span>
                  Departments
                </span>

                <strong>
                  {representedDepartments}
                </strong>

                <small>
                  Represented departments
                </small>

              </div>

            </div>


            <div className="researcher-stat-card">

              <div className="researcher-stat-icon">
                <UserRound size={19} />
              </div>

              <div>

                <span>
                  With Biography
                </span>

                <strong>
                  {researchersWithBiography}
                </strong>

                <small>
                  Completed profiles
                </small>

              </div>

            </div>


          </div>

        </section>


        {/* SEARCH */}

        <section className="researchers-toolbar">

          <div className="researchers-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search researchers, departments, skills, interests..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (

              <button
                className="researcher-clear-search"
                onClick={() =>
                  setSearch("")
                }
              >

                <X size={14} />

              </button>

            )}

          </div>


          <div className="researcher-filters">

            <select
              value={institutionFilter}
              onChange={(e) =>
                setInstitutionFilter(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Institutions
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

        </section>


        {/* CREATE FORM */}

        {showCreateForm && (

          <section className="researcher-create-panel">

            <div className="researcher-create-header">

              <div>

                <span className="researcher-section-label">
                  NEW RESEARCHER
                </span>

                <h2>
                  Add Researcher Profile
                </h2>

                <p>
                  Create a professional researcher
                  profile for the collaboration network.
                </p>

              </div>


              <button
                className="researcher-close-btn"
                onClick={() => {

                  setShowCreateForm(false);

                  setForm(emptyForm);

                  setError("");

                }}
              >

                <X size={18} />

              </button>

            </div>


            <form
              onSubmit={handleCreate}
              className="researcher-form"
            >

              {researcherForm(
                form,
                handleFormChange
              )}


              {error && (

                <div className="researcher-error">

                  <CircleAlert size={16} />

                  {error}

                </div>

              )}


              <div className="researcher-form-actions">

                <button
                  type="button"
                  className="researcher-secondary-btn"
                  onClick={() => {

                    setShowCreateForm(false);

                    setForm(emptyForm);

                    setError("");

                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={submitting}
                  className="researchers-primary-btn"
                >

                  <Plus size={16} />

                  {submitting
                    ? "Creating..."
                    : "Create Researcher"}

                </button>

              </div>

            </form>

          </section>

        )}


        {/* DIRECTORY */}

        <section className="researchers-section researcher-results">

          <div className="researchers-section-heading">

            <div>

              <span className="researcher-section-label">
                RESEARCHER DIRECTORY
              </span>

              <h2>
                {filteredResearchers.length}{" "}
                {filteredResearchers.length === 1
                  ? "Researcher"
                  : "Researchers"}
              </h2>

            </div>


            <span className="researcher-section-caption">
              Search and manage researcher profiles
            </span>

          </div>


          {loading ? (

            <div className="researcher-empty-state">

              <div className="researcher-loader" />

              <strong>
                Loading researchers
              </strong>

              <span>
                Retrieving researcher directory data...
              </span>

            </div>

          ) : filteredResearchers.length === 0 ? (

            <div className="researcher-empty-state">

              <div className="empty-researcher-icon">
                <Users size={23} />
              </div>

              <strong>
                No researchers found
              </strong>

              <span>
                Try changing your filters or add
                a new researcher profile.
              </span>

            </div>

          ) : (

            <div className="researcher-list">

              {filteredResearchers.map(
                (researcher) => {

                  const isEditing =
                    editingId ===
                    researcher.id;


                  /* EDIT MODE */

                  if (isEditing) {

                    return (

                      <article
                        key={researcher.id}
                        className="researcher-card researcher-card--editing"
                      >

                        <div className="researcher-edit-header">

                          <div>

                            <span className="researcher-section-label">
                              PROFILE EDITOR
                            </span>

                            <h3>
                              Update Researcher
                            </h3>

                          </div>


                          <button
                            type="button"
                            className="researcher-close-btn"
                            onClick={cancelEdit}
                          >

                            <X size={17} />

                          </button>

                        </div>


                        <div className="researcher-form">

                          {researcherForm(
                            editForm,
                            handleEditFormChange
                          )}


                          {error && (

                            <div className="researcher-error">

                              <CircleAlert size={16} />

                              {error}

                            </div>

                          )}


                          <div className="researcher-form-actions">

                            <button
                              type="button"
                              className="researcher-secondary-btn"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>


                            <button
                              type="button"
                              className="researchers-primary-btn"
                              disabled={submitting}
                              onClick={() =>
                                saveEdit(
                                  researcher.id
                                )
                              }
                            >

                              <Check size={16} />

                              {submitting
                                ? "Saving..."
                                : "Save Changes"}

                            </button>

                          </div>

                        </div>

                      </article>

                    );
                  }


                  /* NORMAL CARD */

                  return (

                    <article
                      key={researcher.id}
                      className="researcher-card"
                    >

                      <div className="researcher-card-top">

                        <div className="researcher-title-area">

                          <div className="researcher-avatar">

                            {researcher.full_name
                              ?.charAt(0)
                              .toUpperCase()}

                          </div>


                          <div>

                            <div className="researcher-labels">

                              <span className="researcher-profile-badge">
                                Researcher
                              </span>

                            </div>

                            <h3>
                              {researcher.full_name}
                            </h3>

                          </div>

                        </div>


                        <div className="researcher-actions">

                          <button
                            type="button"
                            title="Edit researcher"
                            onClick={() =>
                              startEdit(
                                researcher
                              )
                            }
                          >

                            <Pencil size={15} />

                          </button>


                          <button
                            type="button"
                            title="Delete researcher"
                            className="researcher-danger-action"
                            onClick={() =>
                              handleDelete(
                                researcher.id
                              )
                            }
                          >

                            <Trash2 size={15} />

                          </button>

                        </div>

                      </div>


                      {researcher.bio && (

                        <p className="researcher-bio">
                          {researcher.bio}
                        </p>

                      )}


                      {/* INFORMATION */}

                      <div className="researcher-information">

                        <div className="researcher-info-item">

                          <Building2 size={15} />

                          <div>

                            <span>
                              Institution
                            </span>

                            <strong>
                              {getInstitutionName(
                                researcher.institution_id
                              )}
                            </strong>

                          </div>

                        </div>


                        <div className="researcher-info-item">

                          <GraduationCap size={15} />

                          <div>

                            <span>
                              Department
                            </span>

                            <strong>
                              {getDepartmentName(
                                researcher.department
                              )}
                            </strong>

                          </div>

                        </div>


                        <div className="researcher-info-item">

                          <UserRound size={15} />

                          <div>

                            <span>
                              User ID
                            </span>

                            <strong>
                              {researcher.user_id
                                ? `#${researcher.user_id}`
                                : "Not linked"}
                            </strong>

                          </div>

                        </div>

                      </div>


                      {/* SPECIALIZATION */}

                      <div className="researcher-specialization">

                        {researcher.research_interests && (

                          <div className="researcher-specialization-item">

                            <div className="researcher-specialization-heading">

                              <BookOpen size={14} />

                              <span>
                                Research Interests
                              </span>

                            </div>

                            <p>
                              {
                                researcher.research_interests
                              }
                            </p>

                          </div>

                        )}


                        {researcher.skills && (

                          <div className="researcher-specialization-item">

                            <div className="researcher-specialization-heading">

                              <Code2 size={14} />

                              <span>
                                Skills
                              </span>

                            </div>

                            <p>
                              {researcher.skills}
                            </p>

                          </div>

                        )}

                      </div>


                      {/* FOOTER */}

                      <div className="researcher-card-footer">

                        <span>

                          <Mail size={13} />

                          Research profile

                        </span>


                        <span>
                          Registered researcher
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