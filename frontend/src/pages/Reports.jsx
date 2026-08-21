import { useEffect, useState } from "react";

import AppShell from "../components/AppShell";

import {
  getPublicationReport,
  getResearcherReport,
  getCollaborationReport,
  getInstitutionReport,
  getSavedReports,
  createSavedReport,
  updateSavedReport,
  deleteSavedReport,
  exportCsvReport,
  exportPdfReport,
} from "../api/reports";

import "./Reports.css";


const REPORT_TYPES = [
  "publications",
  "researchers",
  "collaborations",
  "institutions",
];


const REPORT_LABELS = {
  publications: "Publications",
  researchers: "Researchers",
  collaborations: "Collaborations",
  institutions: "Institutions",
};


export default function Reports() {

  const [activeTab, setActiveTab] = useState("publications");

  const [reportData, setReportData] = useState(null);

  const [savedReports, setSavedReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [saveTitle, setSaveTitle] = useState("");

  const [savingReport, setSavingReport] = useState(false);

  const [exporting, setExporting] = useState(false);

  const [editingReport, setEditingReport] = useState(null);

  const [editTitle, setEditTitle] = useState("");

  const [editType, setEditType] = useState("");

  const [updatingReport, setUpdatingReport] = useState(false);


  // =====================================================
  // LOAD REPORT
  // =====================================================

  const fetchReportData = async (type) => {

    setLoading(true);

    setReportData(null);

    setError("");

    try {

      let response;

      switch (type) {

        case "publications":
          response = await getPublicationReport();
          break;

        case "researchers":
          response = await getResearcherReport();
          break;

        case "collaborations":
          response = await getCollaborationReport();
          break;

        case "institutions":
          response = await getInstitutionReport();
          break;

        default:
          throw new Error("Invalid report type.");

      }

      console.log(
        `${type} report response:`,
        response?.data
      );

      setReportData(response?.data || {});

    } catch (err) {

      console.error(
        `Failed to load ${type} report:`,
        err
      );

      const backendMessage =
        err?.response?.data?.detail ||
        err?.message ||
        `Failed to load ${type} report.`;

      setError(backendMessage);

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD SAVED REPORTS
  // =====================================================

  const fetchSavedReports = async () => {

    try {

      const response = await getSavedReports();

      setSavedReports(
        Array.isArray(response?.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load saved reports:",
        err
      );

    }

  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchReportData(activeTab);

  }, [activeTab]);


  useEffect(() => {

    fetchSavedReports();

  }, []);


  // =====================================================
  // SAVE REPORT
  // =====================================================

  const handleSaveReport = async (e) => {

    e.preventDefault();

    if (!saveTitle.trim()) {
      return;
    }

    setSavingReport(true);

    try {

      await createSavedReport({

        title: saveTitle.trim(),

        type: activeTab,

        query_params: JSON.stringify({
          type: activeTab,
        }),

      });

      setSaveTitle("");

      await fetchSavedReports();

    } catch (err) {

      console.error(
        "Failed to save report:",
        err
      );

      alert(
        err?.response?.data?.detail ||
        "Failed to save report configuration."
      );

    } finally {

      setSavingReport(false);

    }

  };


  // =====================================================
  // EDIT REPORT
  // =====================================================

  const handleEditReport = (report) => {

    setEditingReport(report);

    setEditTitle(report.title || "");

    setEditType(report.type || "");

  };


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {

    setEditingReport(null);

    setEditTitle("");

    setEditType("");

  };


  // =====================================================
  // UPDATE REPORT
  // =====================================================

  const handleUpdateReport = async (e) => {

    e.preventDefault();

    if (!editingReport) {
      return;
    }

    if (!editTitle.trim()) {
      return;
    }

    setUpdatingReport(true);

    try {

      await updateSavedReport(
        editingReport.id,
        {
          title: editTitle.trim(),
          type: editType,
          query_params: JSON.stringify({
            type: editType,
          }),
        }
      );

      setEditingReport(null);

      setEditTitle("");

      setEditType("");

      await fetchSavedReports();

      if (editType !== activeTab) {
        setActiveTab(editType);
      }

    } catch (err) {

      console.error(
        "Failed to update report:",
        err
      );

      alert(
        err?.response?.data?.detail ||
        "Failed to update report configuration."
      );

    } finally {

      setUpdatingReport(false);

    }

  };


  // =====================================================
  // DELETE REPORT
  // =====================================================

  const handleDeleteReport = async (reportId) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this saved report?"
    );

    if (!confirmed) {
      return;
    }

    try {

      await deleteSavedReport(reportId);

      await fetchSavedReports();

    } catch (err) {

      console.error(
        "Failed to delete report:",
        err
      );

      alert(
        err?.response?.data?.detail ||
        "Failed to delete saved report."
      );

    }

  };


  // =====================================================
  // DOWNLOAD HELPER
  // =====================================================

  const downloadBlob = (blob, filename) => {

    const blobUrl =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = blobUrl;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(blobUrl);

  };


  // =====================================================
  // CSV EXPORT
  // =====================================================

  const handleDownloadCsv = async () => {

    setExporting(true);

    try {

      const response =
        await exportCsvReport(activeTab);

      downloadBlob(
        response.data,
        `${activeTab}_report.csv`
      );

    } catch (err) {

      console.error(
        "CSV export failed:",
        err
      );

      alert(
        err?.response?.data?.detail ||
        "CSV export failed. Please try again."
      );

    } finally {

      setExporting(false);

    }

  };


  // =====================================================
  // PDF EXPORT
  // =====================================================

  const handleDownloadPdf = async () => {

    setExporting(true);

    try {

      const response =
        await exportPdfReport(activeTab);

      downloadBlob(
        response.data,
        `${activeTab}_report.pdf`
      );

    } catch (err) {

      console.error(
        "PDF export failed:",
        err
      );

      alert(
        err?.response?.data?.detail ||
        "PDF export failed. Please try again."
      );

    } finally {

      setExporting(false);

    }

  };


  // =====================================================
  // SAFE DATA
  // =====================================================

  const safeData = reportData || {};


  const departmentCounts =
    safeData.department_counts &&
    typeof safeData.department_counts === "object"
      ? safeData.department_counts
      : {};


  const skillsSummary =
    Array.isArray(safeData.skills_summary)
      ? safeData.skills_summary
      : [];


  const publicationTypeCounts =
    safeData.type_counts &&
    typeof safeData.type_counts === "object"
      ? safeData.type_counts
      : {};


  const publicationStatusCounts =
    safeData.status_counts &&
    typeof safeData.status_counts === "object"
      ? safeData.status_counts
      : {};


  const collaborationTypeCounts =
    activeTab === "collaborations" &&
    safeData.type_counts &&
    typeof safeData.type_counts === "object"
      ? safeData.type_counts
      : {};


  const researcherInstitutionCounts =
    safeData.researcher_counts_by_institution &&
    typeof safeData.researcher_counts_by_institution === "object"
      ? safeData.researcher_counts_by_institution
      : {};


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <AppShell>

      <main className="reports-page">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="reports-header">

          <div className="reports-header-content">

            <div>

              <span className="reports-eyebrow">
                Analytics & Intelligence
              </span>

              <h1 className="reports-title">
                Research Reports
              </h1>

              <p className="reports-subtitle">
                Analyze research activity, institutional
                relationships, researcher expertise, and
                collaboration performance from one centralized
                reporting workspace.
              </p>

            </div>


            <div className="reports-header-status">

              <span className="reports-status-dot" />

              Live reporting

            </div>

          </div>

        </header>


        {/* =================================================
            REPORT WORKSPACE
        ================================================= */}

        <section className="reports-workspace">


          {/* =================================================
              LEFT NAVIGATION
          ================================================= */}

          <aside className="reports-sidebar">

            <div className="reports-sidebar-heading">

              <span className="reports-section-label">
                Reporting
              </span>

              <h2>
                Report Categories
              </h2>

              <p>
                Select a category to view the latest
                aggregated research data.
              </p>

            </div>


            <nav className="reports-tab-list">

              {REPORT_TYPES.map((type) => (

                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveTab(type)}
                  className={
                    activeTab === type
                      ? "report-tab-btn report-tab-btn--active"
                      : "report-tab-btn"
                  }
                >

                  <span className="report-tab-number">

                    {String(
                      REPORT_TYPES.indexOf(type) + 1
                    ).padStart(2, "0")}

                  </span>

                  <span className="report-tab-text">

                    <strong>
                      {REPORT_LABELS[type]}
                    </strong>

                    <small>

                      {type === "publications" &&
                        "Publication activity"}

                      {type === "researchers" &&
                        "Researcher analytics"}

                      {type === "collaborations" &&
                        "Partnership analytics"}

                      {type === "institutions" &&
                        "Institutional overview"}

                    </small>

                  </span>

                  <span className="report-tab-arrow">
                    →
                  </span>

                </button>

              ))}

            </nav>

          </aside>


          {/* =================================================
              MAIN REPORT
          ================================================= */}

          <section className="reports-content-panel">


            <div className="reports-content-header">

              <div>

                <span className="reports-section-label">
                  Current report
                </span>

                <h2>
                  {REPORT_LABELS[activeTab]} Overview
                </h2>

              </div>

              <span className="reports-live-badge">

                <span />

                Live Data

              </span>

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

              <div className="reports-state">

                <div className="reports-spinner" />

                <strong>
                  Calculating report aggregates
                </strong>

                <p>
                  Gathering the latest data from the
                  research network.
                </p>

              </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (

              <div className="reports-error">

                <div className="reports-error-icon">
                  !
                </div>

                <div>

                  <strong>
                    Unable to load this report
                  </strong>

                  <p>
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      fetchReportData(activeTab)
                    }
                    className="reports-retry-btn"
                  >
                    Try Again
                  </button>

                </div>

              </div>

            )}


            {/* =================================================
                REPORT DATA
            ================================================= */}

            {!loading && !error && reportData && (

              <div className="report-data-display">


                {/* =================================================
                    PUBLICATIONS
                ================================================= */}

                {activeTab === "publications" && (

                  <div className="report-module">

                    <div className="report-primary-stat">

                      <span>
                        Total Publications
                      </span>

                      <strong>
                        {safeData.total_publications ?? 0}
                      </strong>

                      <small>
                        Publications currently tracked
                      </small>

                    </div>


                    <div className="report-two-column">

                      <div className="report-section-block">

                        <span className="reports-section-label">
                          Classification
                        </span>

                        <h3>
                          Publications by Type
                        </h3>

                        {Object.keys(
                          publicationTypeCounts
                        ).length > 0 ? (

                          <div className="report-breakdown-list">

                            {Object.entries(
                              publicationTypeCounts
                            ).map(([type, count]) => (

                              <div
                                className="report-breakdown-row"
                                key={type}
                              >

                                <span>
                                  {type}
                                </span>

                                <strong>
                                  {count}
                                </strong>

                              </div>

                            ))}

                          </div>

                        ) : (

                          <div className="report-empty-state">
                            No publication types recorded.
                          </div>

                        )}

                      </div>


                      <div className="report-section-block">

                        <span className="reports-section-label">
                          Workflow
                        </span>

                        <h3>
                          Publications by Status
                        </h3>

                        {Object.keys(
                          publicationStatusCounts
                        ).length > 0 ? (

                          <div className="report-breakdown-list">

                            {Object.entries(
                              publicationStatusCounts
                            ).map(([status, count]) => (

                              <div
                                className="report-breakdown-row"
                                key={status}
                              >

                                <span>
                                  {status}
                                </span>

                                <strong>
                                  {count}
                                </strong>

                              </div>

                            ))}

                          </div>

                        ) : (

                          <div className="report-empty-state">
                            No publication statuses recorded.
                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                )}


                {/* =================================================
                    RESEARCHERS
                ================================================= */}

                {activeTab === "researchers" && (

                  <div className="report-module">

                    <div className="report-primary-stat">

                      <span>
                        Researcher Profiles
                      </span>

                      <strong>
                        {safeData.total_researchers ?? 0}
                      </strong>

                      <small>
                        Researchers registered in the network
                      </small>

                    </div>


                    <div className="report-two-column">


                      <div className="report-section-block">

                        <span className="reports-section-label">
                          Academic Structure
                        </span>

                        <h3>
                          Researchers by Department
                        </h3>


                        {Object.keys(
                          departmentCounts
                        ).length > 0 ? (

                          <div className="report-breakdown-list">

                            {Object.entries(
                              departmentCounts
                            ).map(([department, count]) => (

                              <div
                                className="report-breakdown-row"
                                key={department}
                              >

                                <span>
                                  {department}
                                </span>

                                <strong>
                                  {count}
                                </strong>

                              </div>

                            ))}

                          </div>

                        ) : (

                          <div className="report-empty-state">
                            No departmental assignments
                            have been recorded.
                          </div>

                        )}

                      </div>


                      <div className="report-section-block">

                        <div className="report-section-heading">

                          <div>

                            <span className="reports-section-label">
                              Research Expertise
                            </span>

                            <h3>
                              Skills Distribution
                            </h3>

                          </div>

                          <span className="report-section-meta">
                            Top 20
                          </span>

                        </div>


                        {skillsSummary.length > 0 ? (

                          <div className="report-skill-list">

                            {skillsSummary.map(
                              (skill, index) => (

                                <span
                                  key={`${skill}-${index}`}
                                  className="report-skill-tag"
                                >
                                  {skill}
                                </span>

                              )
                            )}

                          </div>

                        ) : (

                          <div className="report-empty-state">
                            No researcher skills have
                            been recorded yet.
                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                )}


                {/* =================================================
                    COLLABORATIONS
                ================================================= */}

                {activeTab === "collaborations" && (

                  <div className="report-module">

                    <div className="report-primary-stat">

                      <span>
                        Institutional Collaborations
                      </span>

                      <strong>
                        {safeData.total_collaborations ?? 0}
                      </strong>

                      <small>
                        Partnerships currently recorded
                      </small>

                    </div>


                    <div className="report-section-block">

                      <span className="reports-section-label">
                        Partnership Structure
                      </span>

                      <h3>
                        Collaborations by Type
                      </h3>


                      {Object.keys(
                        collaborationTypeCounts
                      ).length > 0 ? (

                        <div className="report-breakdown-list">

                          {Object.entries(
                            collaborationTypeCounts
                          ).map(([type, count]) => (

                            <div
                              className="report-breakdown-row"
                              key={type}
                            >

                              <span>
                                {type}
                              </span>

                              <strong>
                                {count}
                              </strong>

                            </div>

                          ))}

                        </div>

                      ) : (

                        <div className="report-empty-state">
                          No collaboration types recorded.
                        </div>

                      )}

                    </div>

                  </div>

                )}


                {/* =================================================
                    INSTITUTIONS
                ================================================= */}

                {activeTab === "institutions" && (

                  <div className="report-module">

                    <div className="report-two-column">


                      <div className="report-primary-stat">

                        <span>
                          Registered Institutions
                        </span>

                        <strong>
                          {safeData.total_institutions ?? 0}
                        </strong>

                        <small>
                          Organizations in the network
                        </small>

                      </div>


                      <div className="report-primary-stat">

                        <span>
                          Structural Departments
                        </span>

                        <strong>
                          {safeData.total_departments ?? 0}
                        </strong>

                        <small>
                          Departments currently registered
                        </small>

                      </div>

                    </div>


                    <div className="report-section-block">

                      <span className="reports-section-label">
                        Research Network
                      </span>

                      <h3>
                        Researchers by Institution
                      </h3>


                      {Object.keys(
                        researcherInstitutionCounts
                      ).length > 0 ? (

                        <div className="report-breakdown-list">

                          {Object.entries(
                            researcherInstitutionCounts
                          ).map(([institution, count]) => (

                            <div
                              className="report-breakdown-row"
                              key={institution}
                            >

                              <span>
                                {institution}
                              </span>

                              <strong>
                                {count}
                              </strong>

                            </div>

                          ))}

                        </div>

                      ) : (

                        <div className="report-empty-state">
                          No researcher-institution
                          assignments recorded.
                        </div>

                      )}

                    </div>

                  </div>

                )}


                {/* =================================================
                    EXPORT
                ================================================= */}

                <div className="report-export-panel">

                  <div>

                    <span className="reports-section-label">
                      Data Export
                    </span>

                    <h3>
                      Download this report
                    </h3>

                    <p>
                      Export the current report for
                      documentation, analysis, or sharing.
                    </p>

                  </div>


                  <div className="report-export-actions">

                    <button
                      type="button"
                      onClick={handleDownloadCsv}
                      disabled={exporting}
                      className="report-export-btn report-export-btn--csv"
                    >
                      {exporting
                        ? "Exporting..."
                        : "Export CSV"}
                    </button>


                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={exporting}
                      className="report-export-btn report-export-btn--pdf"
                    >
                      {exporting
                        ? "Exporting..."
                        : "Export PDF"}
                    </button>

                  </div>

                </div>


              </div>

            )}

          </section>

        </section>


        {/* =================================================
            SAVED REPORTS
        ================================================= */}

        <section className="reports-saved-panel">

          <div className="reports-saved-header">

            <div>

              <span className="reports-section-label">
                Report Library
              </span>

              <h2>
                Saved Report Configurations
              </h2>

              <p>
                Save frequently used report views for
                quick access later.
              </p>

            </div>

          </div>


          <form
            onSubmit={handleSaveReport}
            className="saved-report-form"
          >

            <input
              type="text"
              placeholder="Name this report configuration..."
              value={saveTitle}
              onChange={(e) =>
                setSaveTitle(e.target.value)
              }
              required
              className="saved-report-input"
            />

            <button
              type="submit"
              disabled={savingReport}
              className="saved-report-button"
            >
              {savingReport
                ? "Saving..."
                : "Save Configuration"}
            </button>

          </form>


          {/* =================================================
              SAVED REPORTS LIST
          ================================================= */}

          <div className="saved-reports-list">

            {savedReports.length === 0 && (

              <div className="saved-report-empty">
                No saved report configurations yet.
              </div>

            )}


            {savedReports.map((report) => (

              <div
                key={report.id}
                className="saved-report-item"
              >

                <div className="saved-report-info">

                  <strong className="saved-report-title">
                    {report.title}
                  </strong>

                  <span className="saved-report-type">
                    {REPORT_LABELS[report.type] ||
                      report.type}
                    {" configuration"}
                  </span>

                </div>


                <div className="saved-report-actions">

                  <button
                    type="button"
                    onClick={() => {

                      setActiveTab(report.type);

                    }}
                    className="saved-report-generate"
                  >
                    Generate →
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleEditReport(report)
                    }
                    className="saved-report-edit"
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteReport(report.id)
                    }
                    className="saved-report-delete"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>


          {/* =================================================
              EDIT REPORT MODAL
          ================================================= */}

          {editingReport && (

            <div className="report-edit-overlay">

              <div className="report-edit-modal">

                <div className="report-edit-header">

                  <div>

                    <span className="reports-section-label">
                      Report Library
                    </span>

                    <h3>
                      Edit Saved Report
                    </h3>

                  </div>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="report-edit-close"
                  >
                    ×
                  </button>

                </div>


                <form
                  onSubmit={handleUpdateReport}
                  className="report-edit-form"
                >

                  <label>
                    Report Name
                  </label>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) =>
                      setEditTitle(e.target.value)
                    }
                    required
                  />


                  <label>
                    Report Type
                  </label>

                  <select
                    value={editType}
                    onChange={(e) =>
                      setEditType(e.target.value)
                    }
                    required
                  >

                    {REPORT_TYPES.map((type) => (

                      <option
                        key={type}
                        value={type}
                      >
                        {REPORT_LABELS[type]}
                      </option>

                    ))}

                  </select>


                  <div className="report-edit-actions">

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="report-edit-cancel"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={updatingReport}
                      className="report-edit-save"
                    >
                      {updatingReport
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

        </section>

      </main>

    </AppShell>

  );

}