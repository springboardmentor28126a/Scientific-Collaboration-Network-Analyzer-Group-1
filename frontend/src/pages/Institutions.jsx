import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  MapPin,
  Globe2,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  Save,
  ExternalLink,
  Layers3,
} from "lucide-react";

import AppShell from "../components/AppShell";

import {
  createInstitution,
  deleteInstitution,
  getInstitutions,
  updateInstitution,
} from "../api/institutions";

import "./Institutions.css";


const EMPTY_FORM = {
  name: "",
  type: "",
  address: "",
  website: "",
};


const normalizeOptional = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed === "" ? null : trimmed;
};


const buildPayload = (form) => ({
  name: String(form.name ?? "").trim(),
  type: normalizeOptional(form.type),
  address: normalizeOptional(form.address),
  website: normalizeOptional(form.website),
});


const formatWebsite = (website) => {
  if (!website) return "";

  return /^https?:\/\//i.test(website)
    ? website
    : `https://${website}`;
};


export default function Institutions() {

  const [institutions, setInstitutions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingInstitutionId, setEditingInstitutionId] =
    useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  const [showAddForm, setShowAddForm] = useState(false);


  /* =========================================================
     LOAD INSTITUTIONS
     ========================================================= */

  const loadInstitutions = async () => {

    setLoading(true);
    setError("");

    try {

      const response = await getInstitutions();

      const institutionData =
        Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.items)
          ? response.data.items
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

      setInstitutions(institutionData);

    } catch (err) {

      console.error(
        "INSTITUTIONS LOAD ERROR:",
        err.response?.data || err
      );

      setInstitutions([]);

      setError(
        err.response?.data?.detail ||
          "Failed to load institutions."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadInstitutions();
  }, []);


  /* =========================================================
     FORM HANDLERS
     ========================================================= */

  const handleFormChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };


  const handleEditFormChange = (e) => {

    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });

  };


  /* =========================================================
     CREATE
     ========================================================= */

  const handleCreate = async (e) => {

    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {

      await createInstitution(buildPayload(form));

      setForm(EMPTY_FORM);
      setShowAddForm(false);

      await loadInstitutions();

    } catch (err) {

      console.error(
        "CREATE INSTITUTION ERROR:",
        err.response?.data || err
      );

      const detail = err.response?.data?.detail;

      let message = "Failed to create institution.";

      if (Array.isArray(detail)) {

        message = detail
          .map((item) => {

            const field =
              Array.isArray(item.loc)
                ? item.loc.join(" → ")
                : "field";

            return `${field}: ${item.msg}`;

          })
          .join(" | ");

      } else if (typeof detail === "string") {

        message = detail;

      }

      setError(message);

    } finally {

      setSubmitting(false);

    }
  };


  /* =========================================================
     EDIT
     ========================================================= */

  const handleStartEdit = (institution) => {

    setEditingInstitutionId(institution.id);

    setEditForm({
      name: institution.name || "",
      type: institution.type || "",
      address: institution.address || "",
      website: institution.website || "",
    });

  };


  const handleCancelEdit = () => {

    setEditingInstitutionId(null);
    setEditForm(EMPTY_FORM);

  };


  const handleSaveEdit = async (id) => {

    setSubmitting(true);
    setError("");

    try {

      await updateInstitution(
        id,
        buildPayload(editForm)
      );

      setEditingInstitutionId(null);
      setEditForm(EMPTY_FORM);

      await loadInstitutions();

    } catch (err) {

      console.error(
        "UPDATE INSTITUTION ERROR:",
        err.response?.data || err
      );

      const detail = err.response?.data?.detail;

      let message =
        "Failed to save institution updates.";

      if (Array.isArray(detail)) {

        message = detail
          .map((item) => {

            const field =
              Array.isArray(item.loc)
                ? item.loc.join(" → ")
                : "field";

            return `${field}: ${item.msg}`;

          })
          .join(" | ");

      } else if (typeof detail === "string") {

        message = detail;

      }

      setError(message);

    } finally {

      setSubmitting(false);

    }
  };


  /* =========================================================
     DELETE
     ========================================================= */

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this institution?"
      )
    ) {
      return;
    }

    try {

      await deleteInstitution(id);

      await loadInstitutions();

    } catch (err) {

      console.error(
        "DELETE INSTITUTION ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to delete institution."
      );

    }
  };


  /* =========================================================
     TYPES
     ========================================================= */

  const institutionTypes = useMemo(() => {

    const types = institutions
      .map((institution) => institution.type)
      .filter(Boolean);

    return [...new Set(types)].sort();

  }, [institutions]);


  /* =========================================================
     STATISTICS
     ========================================================= */

  const totalInstitutions = institutions.length;

  const categorizedInstitutions =
    institutions.filter(
      (institution) => institution.type
    ).length;

  const institutionsWithWebsites =
    institutions.filter(
      (institution) => institution.website
    ).length;


  /* =========================================================
     FILTER
     ========================================================= */

  const filteredInstitutions = useMemo(() => {

    const query = searchTerm
      .trim()
      .toLowerCase();

    return institutions.filter((institution) => {

      const matchesSearch =
        !query ||
        institution.name
          ?.toLowerCase()
          .includes(query) ||
        institution.type
          ?.toLowerCase()
          .includes(query) ||
        institution.address
          ?.toLowerCase()
          .includes(query);

      const matchesType =
        filterType === "All" ||
        institution.type === filterType;

      return matchesSearch && matchesType;

    });

  }, [
    institutions,
    searchTerm,
    filterType,
  ]);


  return (
    <AppShell>

      <main className="institutions-page">

        {/* =====================================================
            HEADER
            ===================================================== */}

        <header className="institutions-header">

          <div className="institutions-header-content">

            <div className="institutions-header-main">

              <div className="institutions-header-icon">
                <Building2 size={23} />
              </div>

              <div className="institutions-heading-content">

                <div className="institutions-eyebrow">
                  RESEARCH NETWORK
                </div>

                <h1 className="institutions-title">
                  Institution Management
                </h1>

                <p className="institutions-subtitle">
                  Manage universities, research laboratories,
                  institutes, and partner organizations connected
                  to the scientific collaboration network.
                </p>

                <button
                  type="button"
                  className="institution-primary-action"
                  onClick={() =>
                    setShowAddForm(!showAddForm)
                  }
                >

                  {showAddForm ? (
                    <>
                      <X size={16} />
                      Close
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Institution
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>


          {/* TOTAL INSTITUTIONS — RIGHT SIDE */}

          <div className="institution-header-stat">

            <div className="institution-header-stat-icon">
              <Building2 size={19} />
            </div>

            <div className="institution-header-stat-content">

              <span>
                TOTAL INSTITUTIONS
              </span>

              <strong>
                {totalInstitutions}
              </strong>

              <small>
                Registered in network
              </small>

            </div>

          </div>

        </header>


        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (
          <div className="institution-alert">

            <div>
              <strong>
                Action could not be completed
              </strong>

              <p>
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>

          </div>
        )}


        {/* =====================================================
            SUMMARY
            ===================================================== */}

        <section className="institution-summary">

          <div className="institution-summary-card">

            <div className="institution-summary-icon">
              <Building2 size={18} />
            </div>

            <div>

              <span>
                Total Institutions
              </span>

              <strong>
                {totalInstitutions}
              </strong>

              <small>
                Registered in the network
              </small>

            </div>

          </div>


          <div className="institution-summary-card">

            <div className="institution-summary-icon">
              <Layers3 size={18} />
            </div>

            <div>

              <span>
                Categorized
              </span>

              <strong>
                {categorizedInstitutions}
              </strong>

              <small>
                With institution type
              </small>

            </div>

          </div>


          <div className="institution-summary-card">

            <div className="institution-summary-icon">
              <Globe2 size={18} />
            </div>

            <div>

              <span>
                Online Presence
              </span>

              <strong>
                {institutionsWithWebsites}
              </strong>

              <small>
                Institutions with websites
              </small>

            </div>

          </div>

        </section>


        {/* =====================================================
            ADD FORM
            ===================================================== */}

        {showAddForm && (
          <section className="institution-form-section">

            <div className="institution-section-heading">

              <div>

                <span className="institution-section-label">
                  NEW RECORD
                </span>

                <h2>
                  Add Institution
                </h2>

                <p>
                  Register a university, laboratory,
                  institute, or research partner.
                </p>

              </div>

            </div>


            <form
              onSubmit={handleCreate}
              className="institution-form"
            >

              <div className="institution-form-grid">

                <div className="institution-field">

                  <label>
                    Institution Name
                  </label>

                  <input
                    name="name"
                    placeholder="e.g. National Research Institute"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                  />

                </div>


                <div className="institution-field">

                  <label>
                    Institution Type
                  </label>

                  <input
                    name="type"
                    placeholder="University, Research Lab, Industry..."
                    value={form.type}
                    onChange={handleFormChange}
                  />

                </div>


                <div className="institution-field institution-field-wide">

                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    placeholder="Institution address"
                    value={form.address}
                    onChange={handleFormChange}
                    rows={3}
                  />

                </div>


                <div className="institution-field institution-field-wide">

                  <label>
                    Website
                  </label>

                  <input
                    name="website"
                    placeholder="https://example.edu"
                    value={form.website}
                    onChange={handleFormChange}
                  />

                </div>

              </div>


              <div className="institution-form-actions">

                <button
                  type="submit"
                  disabled={submitting}
                  className="institution-submit-btn"
                >

                  <Plus size={16} />

                  {submitting
                    ? "Adding Institution..."
                    : "Create Institution"}

                </button>

              </div>

            </form>

          </section>
        )}


        {/* =====================================================
            DIRECTORY
            ===================================================== */}

        <section className="institution-directory">

          <div className="institution-directory-header">

            <div>

              <span className="institution-section-label">
                DIRECTORY
              </span>

              <h2>
                Research Institutions
              </h2>

              <p>
                Browse and manage organizations
                across the collaboration network.
              </p>

            </div>


            <div className="institution-directory-count">

              {filteredInstitutions.length}

              <span>
                {filteredInstitutions.length === 1
                  ? " institution"
                  : " institutions"}
              </span>

            </div>

          </div>


          {/* SEARCH */}

          <div className="institution-toolbar">

            <div className="institution-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search institutions..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="institution-clear-search"
                >
                  <X size={15} />
                </button>
              )}

            </div>


            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value)
              }
              className="institution-filter"
            >

              <option value="All">
                All institution types
              </option>

              {institutionTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}

            </select>

          </div>


          {/* ===================================================
              LOADING
              =================================================== */}

          {loading ? (

            <div className="institution-loading">

              <div className="institution-spinner" />

              <span>
                Loading institution directory...
              </span>

            </div>

          ) : filteredInstitutions.length === 0 ? (

            <div className="institution-empty">

              <div className="institution-empty-icon">
                <Building2 size={25} />
              </div>

              <h3>
                {institutions.length === 0
                  ? "No institutions yet"
                  : "No matching institutions"}
              </h3>

              <p>
                {institutions.length === 0
                  ? "Start building your research network by adding your first institution."
                  : "Try changing your search term or institution type filter."}
              </p>

              {institutions.length === 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="institution-empty-btn"
                >
                  <Plus size={16} />
                  Add First Institution
                </button>
              )}

            </div>

          ) : (

            <div className="institution-list">

              {filteredInstitutions.map((institution) => {

                const isEditing =
                  editingInstitutionId === institution.id;

                const websiteHref =
                  formatWebsite(institution.website);


                return (
                  <article
                    key={institution.id}
                    className="institution-card"
                  >

                    {isEditing ? (

                      <div className="institution-edit-form">

                        <div className="institution-edit-heading">

                          <div>

                            <span className="institution-section-label">
                              EDIT RECORD
                            </span>

                            <h3>
                              Update Institution
                            </h3>

                          </div>

                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="institution-icon-btn"
                          >
                            <X size={17} />
                          </button>

                        </div>


                        <div className="institution-form-grid">

                          <div className="institution-field">

                            <label>
                              Institution Name
                            </label>

                            <input
                              name="name"
                              value={editForm.name}
                              onChange={handleEditFormChange}
                              required
                            />

                          </div>


                          <div className="institution-field">

                            <label>
                              Institution Type
                            </label>

                            <input
                              name="type"
                              value={editForm.type}
                              onChange={handleEditFormChange}
                            />

                          </div>


                          <div className="institution-field institution-field-wide">

                            <label>
                              Address
                            </label>

                            <textarea
                              name="address"
                              value={editForm.address}
                              onChange={handleEditFormChange}
                              rows={3}
                            />

                          </div>


                          <div className="institution-field institution-field-wide">

                            <label>
                              Website
                            </label>

                            <input
                              name="website"
                              value={editForm.website}
                              onChange={handleEditFormChange}
                            />

                          </div>

                        </div>


                        <div className="institution-actions">

                          <button
                            type="button"
                            onClick={() =>
                              handleSaveEdit(institution.id)
                            }
                            className="institution-save-btn"
                            disabled={submitting}
                          >
                            <Save size={15} />
                            {submitting
                              ? "Saving..."
                              : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="institution-cancel-btn"
                          >
                            Cancel
                          </button>

                        </div>

                      </div>

                    ) : (

                      <>
                        <div className="institution-card-top">

                          <div className="institution-card-icon">
                            <Building2 size={20} />
                          </div>

                          <div className="institution-card-title">

                            <span className="institution-type">
                              {institution.type ||
                                "Institution"}
                            </span>

                            <h3>
                              {institution.name}
                            </h3>

                          </div>

                          <span className="institution-id">
                            ID #{institution.id}
                          </span>

                        </div>


                        <div className="institution-details">

                          <div className="institution-detail">

                            <div className="institution-detail-icon">
                              <MapPin size={15} />
                            </div>

                            <div>

                              <span>
                                Location
                              </span>

                              <strong>
                                {institution.address ||
                                  "No address recorded"}
                              </strong>

                            </div>

                          </div>


                          <div className="institution-detail">

                            <div className="institution-detail-icon">
                              <Globe2 size={15} />
                            </div>

                            <div>

                              <span>
                                Website
                              </span>

                              {institution.website ? (

                                <a
                                  href={websiteHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {institution.website}
                                  <ExternalLink size={12} />
                                </a>

                              ) : (

                                <strong>
                                  No website recorded
                                </strong>

                              )}

                            </div>

                          </div>

                        </div>


                        <div className="institution-actions">

                          <button
                            type="button"
                            onClick={() =>
                              handleStartEdit(institution)
                            }
                            className="institution-edit-btn"
                          >
                            <Pencil size={14} />
                            Edit Details
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(institution.id)
                            }
                            className="institution-delete-btn"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>

                        </div>

                      </>

                    )}

                  </article>
                );

              })}

            </div>

          )}

        </section>

      </main>

    </AppShell>
  );
}