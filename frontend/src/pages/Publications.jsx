import { useEffect, useRef, useState } from "react";
import AppShell from "../components/AppShell";

import {
  getPublications,
  createPublication,
  deletePublication,
  uploadPublicationFile,
} from "../api/publications";

import {
  Plus,
  Search,
  BookOpen,
  Trash2,
  X,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  ChevronDown,
  Upload,
  ExternalLink,
  FileUp,
} from "lucide-react";

import "./Publications.css";


export default function Publications() {

  const [publications, setPublications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [uploadingId, setUploadingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  const cardFileInputRefs = useRef({});


  const [formData, setFormData] = useState({
    title: "",
    type: "",
    status: "Draft",
    doi: "",
    abstract: "",
    visible_to_others: true,
  });


  /* =========================================================
     LOAD PUBLICATIONS
  ========================================================= */

  const loadPublications = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await getPublications(
        statusFilter || undefined
      );

      const data = response?.data;

      if (Array.isArray(data)) {
        setPublications(data);
      } else {
        setPublications([]);
      }

    } catch (err) {

      console.error(
        "Error loading publications:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load publications."
      );

      setPublications([]);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadPublications();

  }, [statusFilter]);


  /* =========================================================
     FORM HANDLING
  ========================================================= */

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

  };


  const resetForm = () => {

    setFormData({
      title: "",
      type: "",
      status: "Draft",
      doi: "",
      abstract: "",
      visible_to_others: true,
    });

    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

  };


  /* =========================================================
     FILE VALIDATION
  ========================================================= */

  const validateFile = (file) => {

    if (!file) {
      return "Please select a file.";
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {

      return (
        "Only PDF, DOC, DOCX and TXT files are allowed."
      );

    }

    return "";

  };


  /* =========================================================
     SELECT FILE FOR NEW PUBLICATION
  ========================================================= */

  const handleFileSelect = (e) => {

    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {

      setSelectedFile(null);

      setError(validationError);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setError("");

    setSelectedFile(file);

  };


  /* =========================================================
     OPEN ADD FORM
  ========================================================= */

  const openAddForm = () => {

    setError("");

    setSuccess("");

    resetForm();

    setShowForm(true);

    setTimeout(() => {

      document
        .getElementById(
          "publication-add-form"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

    }, 100);

  };


  /* =========================================================
     CLOSE ADD FORM
  ========================================================= */

  const closeAddForm = () => {

    if (creating) {
      return;
    }

    setShowForm(false);

    setError("");

    resetForm();

  };


  /* =========================================================
     CREATE PUBLICATION
  ========================================================= */

  const handleCreate = async (e) => {

    e.preventDefault();

    if (!formData.title.trim()) {

      setError(
        "Publication title is required."
      );

      return;

    }

    if (!formData.type.trim()) {

      setError(
        "Publication type is required."
      );

      return;

    }


    try {

      setCreating(true);

      setError("");

      setSuccess("");


      const payload = {

        title: formData.title.trim(),

        type: formData.type.trim(),

        status: formData.status,

        doi:
          formData.doi.trim() || null,

        abstract:
          formData.abstract.trim() || null,

        visible_to_others:
          formData.visible_to_others,

      };


      /* -----------------------------------------------------
         CREATE PUBLICATION FIRST
      ----------------------------------------------------- */

      const response =
        await createPublication(payload);


      const createdPublication =
        response?.data;


      /* -----------------------------------------------------
         UPLOAD SELECTED FILE
      ----------------------------------------------------- */

      if (
        selectedFile &&
        createdPublication?.id
      ) {

        try {

          setUploadingId(
            createdPublication.id
          );

          await uploadPublicationFile(
            createdPublication.id,
            selectedFile
          );

        } catch (uploadError) {

          console.error(
            "Publication created but file upload failed:",
            uploadError
          );

          setError(
            "Publication was created, but the document upload failed."
          );

        } finally {

          setUploadingId(null);

        }

      }


      await loadPublications();


      resetForm();

      setShowForm(false);


      if (!selectedFile) {

        setSuccess(
          "Publication added successfully."
        );

      } else if (!error) {

        setSuccess(
          "Publication and document added successfully."
        );

      }


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });


      setTimeout(() => {

        setSuccess("");

      }, 4000);


    } catch (err) {

      console.error(
        "Error creating publication:",
        err
      );

      const detail =
        err?.response?.data?.detail;


      if (Array.isArray(detail)) {

        setError(
          detail
            .map(
              (item) =>
                item?.msg ||
                "Invalid publication data"
            )
            .join(", ")
        );

      } else {

        setError(
          detail ||
            "Unable to create publication. Please check the entered details."
        );

      }

    } finally {

      setCreating(false);

      setUploadingId(null);

    }

  };


  /* =========================================================
     UPLOAD FILE TO EXISTING PUBLICATION
  ========================================================= */

  const handleExistingFileUpload = async (
    publicationId,
    file
  ) => {

    if (!file) {
      return;
    }


    const validationError =
      validateFile(file);


    if (validationError) {

      setError(validationError);

      return;

    }


    try {

      setUploadingId(publicationId);

      setError("");

      setSuccess("");


      await uploadPublicationFile(
        publicationId,
        file
      );


      await loadPublications();


      setSuccess(
        "Publication document uploaded successfully."
      );


      setTimeout(() => {

        setSuccess("");

      }, 3500);


    } catch (err) {

      console.error(
        "Error uploading publication file:",
        err
      );


      setError(
        err?.response?.data?.detail ||
          "Unable to upload publication document."
      );


    } finally {

      setUploadingId(null);

    }

  };


  /* =========================================================
     DELETE PUBLICATION
  ========================================================= */

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this publication?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(id);

      setError("");

      setSuccess("");


      await deletePublication(id);


      await loadPublications();


      setSuccess(
        "Publication deleted successfully."
      );


      setTimeout(() => {

        setSuccess("");

      }, 3000);


    } catch (err) {

      console.error(
        "Error deleting publication:",
        err
      );


      setError(
        err?.response?.data?.detail ||
          "Unable to delete publication."
      );


    } finally {

      setDeletingId(null);

    }

  };


  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredPublications =
    publications.filter(
      (publication) => {

        const query =
          search.toLowerCase().trim();


        if (!query) {
          return true;
        }


        return (

          String(
            publication.title || ""
          )
            .toLowerCase()
            .includes(query)

          ||

          String(
            publication.type || ""
          )
            .toLowerCase()
            .includes(query)

          ||

          String(
            publication.doi || ""
          )
            .toLowerCase()
            .includes(query)

          ||

          String(
            publication.abstract || ""
          )
            .toLowerCase()
            .includes(query)

        );

      }
    );


  /* =========================================================
     STATUS HELPERS
  ========================================================= */

  const getStatusClass = (status) => {

    const value =
      String(status || "")
        .toLowerCase();


    if (
      value.includes("published") ||
      value.includes("approved")
    ) {

      return "status-published";

    }


    if (
      value.includes("reject") ||
      value.includes("cancel")
    ) {

      return "status-rejected";

    }


    if (
      value.includes("review") ||
      value.includes("pending")
    ) {

      return "status-review";

    }


    return "status-draft";

  };


  const getStatusIcon = (status) => {

    const value =
      String(status || "")
        .toLowerCase();


    if (
      value.includes("published") ||
      value.includes("approved")
    ) {

      return (
        <CheckCircle2 size={14} />
      );

    }


    if (
      value.includes("reject") ||
      value.includes("cancel")
    ) {

      return (
        <XCircle size={14} />
      );

    }


    if (
      value.includes("review") ||
      value.includes("pending")
    ) {

      return (
        <Clock3 size={14} />
      );

    }


    return (
      <FileText size={14} />
    );

  };


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {

    if (!date) {
      return "—";
    }


    try {

      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    } catch {

      return "—";

    }

  };


  /* =========================================================
     FILE NAME
  ========================================================= */

  const getFileName = (fileUrl) => {

    if (!fileUrl) {
      return "";
    }


    const parts =
      fileUrl.split("/");


    return (
      parts[parts.length - 1] ||
      "Research Document"
    );

  };


  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalPublications =
    publications.length;


  const publishedCount =
    publications.filter((p) =>
      String(p.status || "")
        .toLowerCase()
        .includes("published")
    ).length;


  const reviewCount =
    publications.filter((p) => {

      const status =
        String(
          p.status || ""
        ).toLowerCase();


      return (
        status.includes("review") ||
        status.includes("pending")
      );

    }).length;


  const draftCount =
    publications.filter((p) =>
      String(p.status || "")
        .toLowerCase()
        .includes("draft")
    ).length;


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <AppShell>

      <div className="publications-page">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="publications-header">

          <div className="publications-heading">

            <div className="publications-icon">

              <BookOpen size={25} />

            </div>


            <div>

              <h1>
                Publications
              </h1>

              <p>
                Manage research publications,
                academic records, and scholarly
                documents.
              </p>

            </div>

          </div>


          <button
            className="publication-primary-btn"
            onClick={
              showForm
                ? closeAddForm
                : openAddForm
            }
          >

            {showForm ? (

              <>

                <X size={18} />

                Close Form

              </>

            ) : (

              <>

                <Plus size={18} />

                Add Publication

              </>

            )}

          </button>

        </div>


        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (

          <div className="publication-alert publication-error">

            <XCircle size={18} />

            <span>
              {error}
            </span>


            <button
              onClick={() =>
                setError("")
              }
              className="alert-close"
            >

              <X size={16} />

            </button>

          </div>

        )}


        {success && (

          <div className="publication-alert publication-success">

            <CheckCircle2 size={18} />

            <span>
              {success}
            </span>

          </div>

        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="publication-stats">


          <div className="publication-stat-card">

            <div className="stat-card-icon">

              <BookOpen size={20} />

            </div>


            <div>

              <span>
                Total Publications
              </span>

              <strong>
                {totalPublications}
              </strong>

            </div>

          </div>


          <div className="publication-stat-card">

            <div className="stat-card-icon">

              <CheckCircle2 size={20} />

            </div>


            <div>

              <span>
                Published
              </span>

              <strong>
                {publishedCount}
              </strong>

            </div>

          </div>


          <div className="publication-stat-card">

            <div className="stat-card-icon">

              <Clock3 size={20} />

            </div>


            <div>

              <span>
                Under Review
              </span>

              <strong>
                {reviewCount}
              </strong>

            </div>

          </div>


          <div className="publication-stat-card">

            <div className="stat-card-icon">

              <FileText size={20} />

            </div>


            <div>

              <span>
                Drafts
              </span>

              <strong>
                {draftCount}
              </strong>

            </div>

          </div>


        </div>


        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="publications-toolbar">


          <div className="publication-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search publications..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          <div className="publication-filter-wrapper">

            <select
              className="publication-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="">
                All Status
              </option>

              <option value="Draft">
                Draft
              </option>

              <option value="Under Review">
                Under Review
              </option>

              <option value="Published">
                Published
              </option>

              <option value="Rejected">
                Rejected
              </option>

            </select>


            <ChevronDown
              size={16}
              className="filter-arrow"
            />

          </div>


          <button
            className="refresh-publications-btn"
            onClick={loadPublications}
            disabled={loading}
          >

            <RefreshCw
              size={17}
              className={
                loading
                  ? "refresh-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>


        {/* =================================================
            ADD PUBLICATION FORM
        ================================================= */}

        {showForm && (

          <section
            id="publication-add-form"
            className="publication-add-section"
          >


            <div className="publication-add-header">

              <div className="publication-add-title">

                <div className="publication-add-icon">

                  <Plus size={21} />

                </div>


                <div>

                  <h2>
                    Add New Publication
                  </h2>

                  <p>
                    Enter the details of the
                    research publication below.
                  </p>

                </div>

              </div>


              <button
                className="publication-inline-close"
                onClick={closeAddForm}
                disabled={creating}
                title="Close form"
              >

                <X size={19} />

              </button>

            </div>


            <form
              onSubmit={handleCreate}
              className="publication-form"
            >


              {/* TITLE */}

              <div className="form-group full-width">

                <label>

                  Publication Title

                  <span>*</span>

                </label>


                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter the full publication title"
                  required
                  disabled={creating}
                />

              </div>


              {/* TYPE */}

              <div className="form-group">

                <label>

                  Publication Type

                  <span>*</span>

                </label>


                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={creating}
                >

                  <option value="">
                    Select publication type
                  </option>

                  <option value="Journal Article">
                    Journal Article
                  </option>

                  <option value="Conference Paper">
                    Conference Paper
                  </option>

                  <option value="Book Chapter">
                    Book Chapter
                  </option>

                  <option value="Book">
                    Book
                  </option>

                  <option value="Review Article">
                    Review Article
                  </option>

                  <option value="Thesis">
                    Thesis
                  </option>

                  <option value="Technical Report">
                    Technical Report
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* STATUS */}

              <div className="form-group">

                <label>
                  Status
                </label>


                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={creating}
                >

                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Under Review">
                    Under Review
                  </option>

                  <option value="Published">
                    Published
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>

                </select>

              </div>


              {/* DOI */}

              <div className="form-group full-width">

                <label>
                  DOI
                </label>


                <input
                  type="text"
                  name="doi"
                  value={formData.doi}
                  onChange={handleChange}
                  placeholder="e.g. 10.1000/xyz123"
                  disabled={creating}
                />


                <small>
                  Digital Object Identifier assigned
                  to the publication, if available.
                </small>

              </div>


              {/* ABSTRACT */}

              <div className="form-group full-width">

                <label>
                  Abstract
                </label>


                <textarea
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleChange}
                  placeholder="Enter the publication abstract..."
                  rows="6"
                  disabled={creating}
                />

              </div>


              {/* =================================================
                  RESEARCH DOCUMENT
              ================================================= */}

              <div className="form-group full-width">

                <label>
                  Research Document
                </label>


                <div className="publication-file-upload-box">

                  <div className="publication-file-upload-icon">

                    <FileUp size={22} />

                  </div>


                  <div className="publication-file-upload-content">

                    <strong>
                      Upload publication document
                    </strong>

                    <span>
                      PDF, DOC, DOCX or TXT
                    </span>


                    {selectedFile && (

                      <div className="selected-publication-file">

                        <FileText size={16} />

                        <span>
                          {selectedFile.name}
                        </span>

                        <button
                          type="button"
                          onClick={() => {

                            setSelectedFile(null);

                            if (
                              fileInputRef.current
                            ) {
                              fileInputRef.current.value =
                                "";
                            }

                          }}
                          disabled={creating}
                        >

                          <X size={15} />

                        </button>

                      </div>

                    )}

                  </div>


                  <label
                    className="publication-upload-btn"
                  >

                    <Upload size={16} />

                    {selectedFile
                      ? "Change File"
                      : "Choose File"}


                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={
                        handleFileSelect
                      }
                      disabled={creating}
                      hidden
                    />

                  </label>

                </div>


                <small>
                  The document will be linked
                  directly to this publication.
                </small>

              </div>


              {/* VISIBILITY */}

              <div className="publication-visibility-setting">

                <div className="visibility-checkbox">

                  <input
                    type="checkbox"
                    id="visible_to_others"
                    name="visible_to_others"
                    checked={
                      formData.visible_to_others
                    }
                    onChange={handleChange}
                    disabled={creating}
                  />


                  <div>

                    <label
                      htmlFor="visible_to_others"
                    >
                      Make this publication visible
                      to other researchers
                    </label>

                    <p>
                      Other researchers in the
                      system will be able to view
                      this publication.
                    </p>

                  </div>

                </div>

              </div>


              {/* FORM ACTIONS */}

              <div className="publication-form-actions">


                <button
                  type="button"
                  className="publication-cancel-btn"
                  onClick={closeAddForm}
                  disabled={creating}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="publication-submit-btn"
                  disabled={creating}
                >

                  {creating ? (

                    <>

                      <RefreshCw
                        size={17}
                        className="refresh-spin"
                      />

                      {uploadingId
                        ? "Uploading Document..."
                        : "Saving Publication..."}

                    </>

                  ) : (

                    <>

                      <Plus size={17} />

                      Add Publication

                    </>

                  )}

                </button>

              </div>

            </form>

          </section>

        )}


        {/* =================================================
            PUBLICATIONS CONTAINER
        ================================================= */}

        <section className="publications-container">


          <div className="publications-container-header">

            <div>

              <h2>
                Research Publications
              </h2>

              <p>

                {filteredPublications.length}

                {" "}

                publication
                {filteredPublications.length !== 1
                  ? "s"
                  : ""}

                {" "}found

              </p>

            </div>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="publication-empty">

              <RefreshCw
                size={28}
                className="refresh-spin"
              />

              <h3>
                Loading publications...
              </h3>

              <p>
                Fetching publication records
                from the research database.
              </p>

            </div>

          ) : filteredPublications.length === 0 ? (

            <div className="publication-empty">

              <div className="empty-publication-icon">

                <BookOpen size={30} />

              </div>


              <h3>

                {search
                  ? "No publications found"
                  : "No publications yet"}

              </h3>


              <p>

                {search
                  ? "Try changing your search or filter."
                  : "Add your first research publication to get started."}

              </p>


              {!search && !showForm && (

                <button
                  className="publication-primary-btn"
                  onClick={openAddForm}
                >

                  <Plus size={17} />

                  Add Publication

                </button>

              )}

            </div>

          ) : (

            <div className="publication-grid">


              {filteredPublications.map(
                (publication) => (

                  <article
                    className="publication-card"
                    key={publication.id}
                  >


                    {/* CARD TOP */}

                    <div className="publication-card-top">


                      <div className="publication-type-icon">

                        <BookOpen size={20} />

                      </div>


                      <span
                        className={`publication-status ${getStatusClass(
                          publication.status
                        )}`}
                      >

                        {getStatusIcon(
                          publication.status
                        )}

                        {publication.status ||
                          "Draft"}

                      </span>

                    </div>


                    {/* CARD BODY */}

                    <div className="publication-card-body">


                      <h3>

                        {publication.title ||
                          "Untitled Publication"}

                      </h3>


                      <div className="publication-type">

                        {publication.type ||
                          "Publication"}

                      </div>


                      {publication.abstract && (

                        <p className="publication-abstract">

                          {publication.abstract}

                        </p>

                      )}


                      <div className="publication-details">


                        {publication.doi && (

                          <div className="publication-detail">

                            <span>
                              DOI
                            </span>

                            <strong>
                              {publication.doi}
                            </strong>

                          </div>

                        )}


                        {publication.created_at && (

                          <div className="publication-detail">

                            <span>
                              Added
                            </span>

                            <strong>
                              {formatDate(
                                publication.created_at
                              )}
                            </strong>

                          </div>

                        )}


                        {publication.updated_at && (

                          <div className="publication-detail">

                            <span>
                              Updated
                            </span>

                            <strong>
                              {formatDate(
                                publication.updated_at
                              )}
                            </strong>

                          </div>

                        )}

                      </div>


                      {/* =================================================
                          DOCUMENT SECTION
                      ================================================= */}

                      <div className="publication-document-section">


                        <div className="publication-document-heading">

                          <div className="publication-document-label">

                            <FileText size={16} />

                            <span>
                              Research Document
                            </span>

                          </div>


                          {publication.file_url && (

                            <span className="publication-file-status">

                              <CheckCircle2
                                size={14}
                              />

                              Uploaded

                            </span>

                          )}

                        </div>


                        {publication.file_url ? (

                          <div className="publication-document-actions">


                            <div className="publication-file-name">

                              <FileText
                                size={16}
                              />

                              <span>
                                {getFileName(
                                  publication.file_url
                                )}
                              </span>

                            </div>


                            <div className="publication-file-buttons">


                              <a
                                href={`http://localhost:8000${publication.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="publication-view-file-btn"
                              >

                                <ExternalLink
                                  size={15}
                                />

                                View Document

                              </a>


                              <label
                                className="publication-replace-file-btn"
                              >

                                <Upload
                                  size={15}
                                />

                                {uploadingId ===
                                publication.id
                                  ? "Uploading..."
                                  : "Replace"}


                                <input
                                  ref={(element) => {

                                    cardFileInputRefs.current[
                                      publication.id
                                    ] = element;

                                  }}
                                  type="file"
                                  accept=".pdf,.doc,.docx,.txt"
                                  hidden
                                  disabled={
                                    uploadingId ===
                                    publication.id
                                  }
                                  onChange={(e) => {

                                    const file =
                                      e.target.files?.[0];


                                    handleExistingFileUpload(
                                      publication.id,
                                      file
                                    );


                                    e.target.value =
                                      "";

                                  }}
                                />

                              </label>

                            </div>

                          </div>

                        ) : (

                          <div className="publication-no-file">

                            <span>
                              No research document
                              uploaded.
                            </span>


                            <label
                              className="publication-upload-card-btn"
                            >

                              <Upload
                                size={15}
                              />

                              {uploadingId ===
                              publication.id
                                ? "Uploading..."
                                : "Upload File"}


                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                hidden
                                disabled={
                                  uploadingId ===
                                  publication.id
                                }
                                onChange={(e) => {

                                  const file =
                                    e.target.files?.[0];


                                  handleExistingFileUpload(
                                    publication.id,
                                    file
                                  );


                                  e.target.value =
                                    "";

                                }}
                              />

                            </label>

                          </div>

                        )}

                      </div>

                    </div>


                    {/* CARD FOOTER */}

                    <div className="publication-card-footer">


                      <div className="publication-visibility">

                        <Eye size={15} />

                        {publication.visible_to_others
                          ? "Visible to researchers"
                          : "Private"}

                      </div>


                      <button
                        className="publication-delete-btn"
                        onClick={() =>
                          handleDelete(
                            publication.id
                          )
                        }
                        disabled={
                          deletingId ===
                          publication.id
                        }
                        title="Delete publication"
                      >

                        {deletingId ===
                        publication.id ? (

                          <RefreshCw
                            size={16}
                            className="refresh-spin"
                          />

                        ) : (

                          <Trash2 size={16} />

                        )}

                        Delete

                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </AppShell>

  );

}