import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import {
  getPublicationReport,
  getResearcherReport,
  getCollaborationReport,
  getInstitutionReport,
  getSavedReports,
  createSavedReport,
  getCsvExportUrl,
  getPdfExportUrl,
} from "../api/reports";
import "./Reports.css";

const REPORT_TYPES = ["publications", "researchers", "collaborations", "institutions"];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("publications");
  const [reportData, setReportData] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saveTitle, setSaveTitle] = useState("");
  const [savingReport, setSavingReport] = useState(false);

  const fetchReportData = async (type) => {
    setLoading(true);
    setReportData(null);
    try {
      let res;
      if (type === "publications") res = await getPublicationReport();
      else if (type === "researchers") res = await getResearcherReport();
      else if (type === "collaborations") res = await getCollaborationReport();
      else if (type === "institutions") res = await getInstitutionReport();
      
      setReportData(res.data);
      setError("");
    } catch {
      setError(`Failed to load report for ${type}.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedReports = async () => {
    try {
      const res = await getSavedReports();
      setSavedReports(res.data);
    } catch {
      console.error("Failed to load saved report configs.");
    }
  };

  useEffect(() => {
    fetchReportData(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchSavedReports();
  }, []);

  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (!saveTitle) return;
    setSavingReport(true);
    try {
      await createSavedReport({
        title: saveTitle,
        type: activeTab,
        query_params: JSON.stringify({ type: activeTab }),
      });
      setSaveTitle("");
      await fetchSavedReports();
    } catch {
      alert("Failed to save report configuration");
    } finally {
      setSavingReport(false);
    }
  };

  const handleDownloadCsv = () => {
    const url = getCsvExportUrl(activeTab);
    window.open(url, "_blank");
  };

  const handleDownloadPdf = () => {
    const url = getPdfExportUrl(activeTab);
    window.open(url, "_blank");
  };

  return (
    <AppShell>
      <main className="reports-page">
        <header className="reports-header">
          <div>
            <p className="dashboard-badge">Business Intelligence</p>
            <h1 className="reports-title">Reports & Export</h1>
            <p className="reports-subtitle">
              Aggregate research metrics, audit institutional partnerships, and export compliant Excel/PDF summaries.
            </p>
          </div>
        </header>

        <div className="reports-grid">
          {/* Sidebar Tabs */}
          <aside className="reports-sidebar">
            <h3>Report Categories</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "14px" }}>
              Select a report type to view live aggregates.
            </p>
            {REPORT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`report-tab-btn ${activeTab === t ? "report-tab-btn--active" : ""}`}
                style={{ textTransform: "capitalize" }}
              >
                {t} Report
              </button>
            ))}
          </aside>

          {/* Report Data panel */}
          <section className="reports-content-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ textTransform: "capitalize" }}>{activeTab} Summary</h2>
              <span className="dashboard-badge" style={{ background: "var(--accent-secondary-bg)" }}>Live Data</span>
            </div>

            {loading ? (
              <p className="pub-loading">Calculating report aggregates...</p>
            ) : error ? (
              <p className="pub-error">{error}</p>
            ) : (
              <div className="report-data-display">
                {/* Publications Report details */}
                {activeTab === "publications" && reportData && (
                  <div>
                    <div className="report-stat-row">
                      <span>Total Publications Tracked</span>
                      <strong>{reportData.total_publications}</strong>
                    </div>
                    <div style={{ marginTop: "14px" }}>
                      <h4>By Type:</h4>
                      {Object.entries(reportData.type_counts).map(([type, count]) => (
                        <div className="report-stat-row" key={type} style={{ paddingLeft: "12px" }}>
                          <span>{type}</span>
                          <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: "14px" }}>
                      <h4>By Status:</h4>
                      {Object.entries(reportData.status_counts).map(([status, count]) => (
                        <div className="report-stat-row" key={status} style={{ paddingLeft: "12px" }}>
                          <span>{status}</span>
                          <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Researchers Report details */}
                {activeTab === "researchers" && reportData && (
                  <div>
                    <div className="report-stat-row">
                      <span>Total Researchers Profiles</span>
                      <strong>{reportData.total_researchers}</strong>
                    </div>
                    <div style={{ marginTop: "14px" }}>
                      <h4>By Academic Department:</h4>
                      {Object.keys(reportData.department_counts).length === 0 ? (
                        <p className="pub-empty">No departmental assignments found.</p>
                      ) : (
                        Object.entries(reportData.department_counts).map(([dep, count]) => (
                          <div className="report-stat-row" key={dep} style={{ paddingLeft: "12px" }}>
                            <span>{dep}</span>
                            <strong>{count}</strong>
                          </div>
                        ))
                      )}
                    </div>
                    <div style={{ marginTop: "14px" }}>
                      <h4>Skills Distribution (Top 20):</h4>
                      {reportData.skills_summary.length === 0 ? (
                        <p className="pub-empty">No skills listed.</p>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                          {reportData.skills_summary.map((skill) => (
                            <span
                              key={skill}
                              style={{
                                background: "var(--accent-bg)",
                                color: "#1e3a8a",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "0.8rem",
                                fontWeight: "700",
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Collaborations Report details */}
                {activeTab === "collaborations" && reportData && (
                  <div>
                    <div className="report-stat-row">
                      <span>Total Partnerships Recorded</span>
                      <strong>{reportData.total_collaborations}</strong>
                    </div>
                    <div style={{ marginTop: "14px" }}>
                      <h4>By Partnership Type:</h4>
                      {Object.entries(reportData.type_counts).map(([type, count]) => (
                        <div className="report-stat-row" key={type} style={{ paddingLeft: "12px" }}>
                          <span>{type}</span>
                          <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Institutions Report details */}
                {activeTab === "institutions" && reportData && (
                  <div>
                    <div className="report-stat-row">
                      <span>Total Organizations Registered</span>
                      <strong>{reportData.total_institutions}</strong>
                    </div>
                    <div className="report-stat-row">
                      <span>Total Structural Departments</span>
                      <strong>{reportData.total_departments}</strong>
                    </div>
                    <div style={{ marginTop: "14px" }}>
                      <h4>Researcher Distribution:</h4>
                      {Object.entries(reportData.researcher_counts_by_institution).map(([inst, count]) => (
                        <div className="report-stat-row" key={inst} style={{ paddingLeft: "12px" }}>
                          <span>{inst}</span>
                          <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Export actions */}
                <div className="report-export-actions">
                  <button onClick={handleDownloadCsv} className="report-export-btn report-export-btn--csv">
                    💾 Export to Excel (CSV)
                  </button>
                  <button onClick={handleDownloadPdf} className="report-export-btn report-export-btn--pdf">
                    📄 Export PDF Summary
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Saved Reports Section */}
        <section className="reports-saved-panel">
          <h3>Saved Report Configurations</h3>
          <form onSubmit={handleSaveReport} style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <input
              placeholder="Name this report setup..."
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              required
              className="proj-input"
              style={{ flex: "1", marginBottom: "0" }}
            />
            <button type="submit" disabled={savingReport} className="proj-button" style={{ background: "var(--accent-secondary, #10b981)" }}>
              {savingReport ? "Saving..." : "Save Config"}
            </button>
          </form>

          <div className="saved-reports-list">
            {savedReports.length === 0 && <p className="pub-empty">No configurations saved.</p>}
            {savedReports.map((rep) => (
              <div key={rep.id} className="saved-report-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{rep.title}</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: "8px", textTransform: "capitalize" }}>
                    ({rep.type} configuration)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab(rep.type);
                  }}
                  className="proj-assign-btn"
                >
                  Generate
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
