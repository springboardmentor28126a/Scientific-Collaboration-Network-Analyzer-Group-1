import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";
import { fetchInstitutions } from "../services/institutionService";
import { fetchDepartments } from "../services/departmentService";
import { fetchConferences } from "../services/conferenceService";
import {
  fetchResearcherReport,
  fetchPublicationReport,
  fetchConferenceReport,
  exportPublicationReportCSV,
  exportPublicationReportExcel,
  exportPublicationReportPDF,
} from "../services/reportService";

const TABS = ["Researchers", "Publications", "Conferences"];

function ReportsPage() {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState("Researchers");
  const [loading, setLoading] = useState(true);

  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [conferences, setConferences] = useState([]);

  const [filters, setFilters] = useState({
    institution_id: "",
    department_id: "",
    conference_id: "",
    status: "",
    publication_type: "",
  });

  const [researcherData, setResearcherData] = useState([]);
  const [publicationData, setPublicationData] = useState([]);
  const [conferenceData, setConferenceData] = useState([]);

  useEffect(() => {
    fetchInstitutions().then(setInstitutions).catch(() => {});
    fetchDepartments().then(setDepartments).catch(() => {});
    fetchConferences().then(setConferences).catch(() => {});
  }, []);

  useEffect(() => {
    loadActiveReport();
  }, [activeTab, filters]);

  const cleanFilters = () => {
    const f = {};
    if (filters.institution_id) f.institution_id = Number(filters.institution_id);
    if (filters.department_id) f.department_id = Number(filters.department_id);
    if (filters.conference_id) f.conference_id = Number(filters.conference_id);
    if (filters.status) f.status = filters.status;
    if (filters.publication_type) f.publication_type = filters.publication_type;
    return f;
  };

  const loadActiveReport = async () => {
    try {
      setLoading(true);
      const f = cleanFilters();
      if (activeTab === "Researchers") {
        setResearcherData(await fetchResearcherReport(f));
      } else if (activeTab === "Publications") {
        setPublicationData(await fetchPublicationReport(f));
      } else {
        setConferenceData(await fetchConferenceReport());
      }
    } catch (err) {
      toast.error("Could not load report.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExport = async (format) => {
  try {
    if (format === "csv") await exportPublicationReportCSV(cleanFilters());
    if (format === "excel") await exportPublicationReportExcel(cleanFilters());
    if (format === "pdf") await exportPublicationReportPDF(cleanFilters());
    toast.success("Report downloaded.");
  } catch (err) {
    toast.error("Could not export report.");
  }
};

  const isSystemAdmin = auth?.role === "SYSTEM_ADMIN";

  return (
    <DashboardLayout>
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <h4 className="fw-bold mb-1">Reports</h4>
          <p className="text-muted mb-3">Researcher, publication, and conference summaries.</p>

          <ul className="nav nav-tabs">
            {TABS.map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {(activeTab === "Researchers" || activeTab === "Publications") && (
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body">
            <div className="row">
              {isSystemAdmin && (
                <div className="col-md-3 mb-2">
                  <select className="form-select" name="institution_id" value={filters.institution_id} onChange={handleFilterChange}>
                    <option value="">All institutions</option>
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>{i.institution_name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="col-md-3 mb-2">
                <select className="form-select" name="department_id" value={filters.department_id} onChange={handleFilterChange}>
                  <option value="">All departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              </div>

              {activeTab === "Publications" && (
                <>
                  <div className="col-md-3 mb-2">
                    <select className="form-select" name="conference_id" value={filters.conference_id} onChange={handleFilterChange}>
                      <option value="">All conferences</option>
                      {conferences.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3 mb-2">
                    <select className="form-select" name="status" value={filters.status} onChange={handleFilterChange}>
                      <option value="">All statuses</option>
                      <option value="DRAFT">Draft</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div className="col-md-3 mb-2">
                    <select className="form-select" name="publication_type" value={filters.publication_type} onChange={handleFilterChange}>
                      <option value="">All types</option>
                      <option value="JOURNAL_PAPER">Journal Paper</option>
                      <option value="CONFERENCE_PAPER">Conference Paper</option>
                      <option value="BOOK">Book</option>
                      <option value="PATENT">Patent</option>
                      <option value="TECHNICAL_REPORT">Technical Report</option>
                    </select>
                  </div>
                  <div className="col-md-3 mb-2">
  <div className="btn-group w-100">
    <button className="btn btn-outline-primary" onClick={() => handleExport("csv")}>CSV</button>
    <button className="btn btn-outline-primary" onClick={() => handleExport("excel")}>Excel</button>
    <button className="btn btn-outline-primary" onClick={() => handleExport("pdf")}>PDF</button>
  </div>
</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : activeTab === "Researchers" ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th><th>Institution</th><th>Department</th>
                    <th>Publications</th><th>Citations</th>
                  </tr>
                </thead>
                <tbody>
                  {researcherData.map((r) => (
                    <tr key={r.researcher_id}>
                      <td>{r.first_name} {r.last_name}</td>
                      <td>{r.institution_name}</td>
                      <td>{r.department_name}</td>
                      <td>{r.publication_count}</td>
                      <td>{r.citation_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "Publications" ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Title</th><th>Type</th><th>Status</th><th>Author</th>
                    <th>Institution</th><th>Conference</th><th>Citations</th>
                  </tr>
                </thead>
                <tbody>
                  {publicationData.map((p) => (
                    <tr key={p.publication_id}>
                      <td>{p.title}</td>
                      <td>{p.publication_type?.replaceAll("_", " ")}</td>
                      <td>{p.status}</td>
                      <td>{p.owner_first_name} {p.owner_last_name}</td>
                      <td>{p.institution_name}</td>
                      <td>{p.conference_title || "-"}</td>
                      <td>{p.citation_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Conference</th><th>Dates</th><th>Total</th>
                    <th>Presenters</th><th>Attendees</th>
                  </tr>
                </thead>
                <tbody>
                  {conferenceData.map((c) => (
                    <tr key={c.conference_id}>
                      <td>{c.title}</td>
                      <td>{new Date(c.start_date).toLocaleDateString()} – {new Date(c.end_date).toLocaleDateString()}</td>
                      <td>{c.total_participants}</td>
                      <td>{c.presenter_count}</td>
                      <td>{c.attendee_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ReportsPage;