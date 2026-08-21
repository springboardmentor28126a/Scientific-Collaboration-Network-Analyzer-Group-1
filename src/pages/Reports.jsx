import { useEffect, useState } from "react";
import { FileSpreadsheet, FileDown, Calendar, TrendingUp, BarChart3, Briefcase, Award, ArrowUpDown } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import Navbar from "../components/Navbar";
import api from "../api/api";

function Reports() {
  const [activeTab, setActiveTab] = useState("publications");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Data states
  const [publications, setPublications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [researchers, setResearchers] = useState([]);

  // Fetch all data
  const fetchData = async () => {
    try {
      const [pubRes, projRes, collabRes, instRes, resRes] = await Promise.all([
        api.get("/publications").catch(() => ({ data: [] })),
        api.get("/projects").catch(() => ({ data: [] })),
        api.get("/collaborations").catch(() => ({ data: [] })),
        api.get("/institutions").catch(() => ({ data: [] })),
        api.get("/researchers").catch(() => ({ data: [] }))
      ]);

      setPublications(pubRes.data);
      setProjects(projRes.data);
      setCollaborations(collabRes.data);
      setInstitutions(instRes.data);
      setResearchers(resRes.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sorting helper
  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const getSortedData = (data) => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    let headers = [];
    let rows = [];
    let filename = "";

    if (activeTab === "publications") {
      filename = "SciNexus_Publication_Report.csv";
      headers = ["Title", "Authors", "Type", "Status", "Journal/Conference", "Citations", "Published Date"];
      rows = publications.map(p => [
        p.title, p.authors, p.pub_type, p.status, p.journal_conference || "", p.citation_count, p.published_date || ""
      ]);
    } else if (activeTab === "projects") {
      filename = "SciNexus_Research_Projects_Report.csv";
      headers = ["Project Title", "Funding Agency", "Budget ($)", "Status", "Start Date", "End Date"];
      rows = projects.map(p => [
        p.title, p.funding_agency || "", p.budget, p.status, p.start_date, p.end_date || ""
      ]);
    } else if (activeTab === "collaborations") {
      filename = "SciNexus_Collaborations_Report.csv";
      headers = ["Lead Researcher ID", "Partner Researcher ID", "Status", "Established Date"];
      rows = collaborations.map(c => [
        c.researcher_id, c.partner_researcher_id, c.status, c.collaborated_at
      ]);
    } else if (activeTab === "institutions") {
      filename = "SciNexus_Institution_Report.csv";
      headers = ["Institution Name", "Type", "Address", "Website"];
      rows = institutions.map(i => [
        i.name, i.type, i.address, i.website || ""
      ]);
    }

    // Build CSV string
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF (Triggers Print layout)
  const handleExportPDF = () => {
    window.print();
  };

  // Process data for charts
  const getPubTypeData = () => {
    const counts = {};
    publications.forEach(p => {
      counts[p.pub_type] = (counts[p.pub_type] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  };

  const getProjectBudgetData = () => {
    return projects.map(p => ({
      name: p.title.length > 25 ? p.title.substring(0, 22) + "..." : p.title,
      budget: p.budget
    }));
  };

  const COLORS = ["#c1123f", "#3b82f6", "#f59e0b", "#107c41", "#8b5cf6"];

  return (
    <div className="reports-page">
      <Navbar />

      <div className="page-header">
        <TrendingUp size={45} />
        <div>
          <h1>Reports & Export</h1>
          <p>Generate research summaries, collaboration reports, project audits, and export to Excel/PDF.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="report-tabs">
        <button 
          className={`report-tab-btn ${activeTab === "publications" ? "active" : ""}`}
          onClick={() => { setActiveTab("publications"); setSortField(""); }}
        >
          Publication Reports
        </button>
        <button 
          className={`report-tab-btn ${activeTab === "projects" ? "active" : ""}`}
          onClick={() => { setActiveTab("projects"); setSortField(""); }}
        >
          Research Reports
        </button>
        <button 
          className={`report-tab-btn ${activeTab === "collaborations" ? "active" : ""}`}
          onClick={() => { setActiveTab("collaborations"); setSortField(""); }}
        >
          Collaboration Reports
        </button>
        <button 
          className={`report-tab-btn ${activeTab === "institutions" ? "active" : ""}`}
          onClick={() => { setActiveTab("institutions"); setSortField(""); }}
        >
          Institution Reports
        </button>
      </div>

      {/* Controls */}
      <div className="report-controls">
        <h2 style={{ color: "white", margin: 0 }}>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Overview
        </h2>
        <div className="export-group">
          <button className="export-btn excel" onClick={handleExportExcel}>
            <FileSpreadsheet size={16} />
            Export to Excel
          </button>
          <button className="export-btn pdf" onClick={handleExportPDF}>
            <FileDown size={16} />
            Export to PDF
          </button>
        </div>
      </div>

      {/* Reports Grid (Table + Visual Analytics side-by-side) */}
      <div className="reports-grid">
        
        {/* DATA TABLE */}
        <div className="institution-table-container" style={{ margin: 0 }}>
          <table className="institution-table">
            <thead>
              {activeTab === "publications" && (
                <tr>
                  <th onClick={() => handleSort("title")} style={{ cursor: "pointer" }}>Title <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th onClick={() => handleSort("authors")} style={{ cursor: "pointer" }}>Authors <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th onClick={() => handleSort("pub_type")} style={{ cursor: "pointer" }}>Type <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>Status <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th onClick={() => handleSort("citation_count")} style={{ cursor: "pointer" }}>Citations <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th onClick={() => handleSort("published_date")} style={{ cursor: "pointer" }}>Published Date <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                </tr>
              )}

              {activeTab === "projects" && (
                <tr>
                  <th onClick={() => handleSort("title")} style={{ cursor: "pointer" }}>Project Title <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th onClick={() => handleSort("funding_agency")} style={{ cursor: "pointer" }}>Funding Agency <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th onClick={() => handleSort("budget")} style={{ cursor: "pointer" }}>Budget ($) <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>Status <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th>Timeline</th>
                </tr>
              )}

              {activeTab === "collaborations" && (
                <tr>
                  <th>Lead Researcher</th>
                  <th>Partner Researcher</th>
                  <th>Lead Institution</th>
                  <th>Partner Institution</th>
                  <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>Status <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th onClick={() => handleSort("collaborated_at")} style={{ cursor: "pointer" }}>Established Date <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                </tr>
              )}

              {activeTab === "institutions" && (
                <tr>
                  <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>Institution Name <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th onClick={() => handleSort("type")} style={{ cursor: "pointer" }}>Type <ArrowUpDown size={12} style={{ display: "inline" }} /></th>
                  <th>Address</th>
                  <th>Website</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === "publications" && (
                getSortedData(publications).length > 0 ? (
                  getSortedData(publications).map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "600", color: "white" }}>{p.title}</td>
                      <td>{p.authors}</td>
                      <td>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          background: "rgba(139, 92, 246, 0.15)",
                          color: "#8b5cf6",
                          border: "1px solid rgba(139, 92, 246, 0.3)"
                        }}>
                          {p.pub_type}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          background: p.status === "Published" ? "rgba(16, 124, 65, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: p.status === "Published" ? "#107c41" : "#f59e0b"
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: "bold" }}>{p.citation_count}</td>
                      <td>{p.published_date ? new Date(p.published_date).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{ textAlign: "center", color: "#c8b6bd" }}>No publications found.</td></tr>
                )
              )}

              {activeTab === "projects" && (
                getSortedData(projects).length > 0 ? (
                  getSortedData(projects).map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "600", color: "white" }}>{p.title}</td>
                      <td>{p.funding_agency || "-"}</td>
                      <td style={{ color: "#107c41", fontWeight: "bold" }}>${p.budget.toLocaleString()}</td>
                      <td>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          background: p.status === "Active" ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 124, 65, 0.15)",
                          color: p.status === "Active" ? "#3b82f6" : "#107c41"
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td>{new Date(p.start_date).getFullYear()} - {p.end_date ? new Date(p.end_date).getFullYear() : "Present"}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ textAlign: "center", color: "#c8b6bd" }}>No research projects found.</td></tr>
                )
              )}

              {activeTab === "collaborations" && (
                getSortedData(collaborations).length > 0 ? (
                  getSortedData(collaborations).map((c) => {
                    const res = researchers.find(r => r.id === c.researcher_id) || { name: c.researcher_id };
                    const partner = researchers.find(r => r.id === c.partner_researcher_id) || { name: c.partner_researcher_id };
                    const inst = institutions.find(i => i.id === c.institution_id) || { name: c.institution_id || "-" };
                    const partnerInst = institutions.find(i => i.id === c.partner_institution_id) || { name: c.partner_institution_id || "-" };

                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: "600", color: "white" }}>{res.name}</td>
                        <td style={{ fontWeight: "600", color: "white" }}>{partner.name}</td>
                        <td>{inst.name}</td>
                        <td>{partnerInst.name}</td>
                        <td>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            background: "rgba(16, 124, 65, 0.15)",
                            color: "#107c41"
                          }}>
                            {c.status}
                          </span>
                        </td>
                        <td>{new Date(c.collaborated_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="6" style={{ textAlign: "center", color: "#c8b6bd" }}>No collaborations found.</td></tr>
                )
              )}

              {activeTab === "institutions" && (
                getSortedData(institutions).length > 0 ? (
                  getSortedData(institutions).map((i) => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: "600", color: "white" }}>{i.name}</td>
                      <td>{i.type}</td>
                      <td>{i.address}</td>
                      <td><a href={i.website} target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>{i.website || "-"}</a></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" style={{ textAlign: "center", color: "#c8b6bd" }}>No institutions found.</td></tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* SIDE VISUAL ANALYTICS BOX */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {activeTab === "publications" && (
            <div className="dashboard-box" style={{ margin: 0, height: "100%" }}>
              <h2>Publication Types</h2>
              <div style={{ width: "100%", height: "220px" }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={getPubTypeData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getPubTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#050812", borderColor: "#6b2639" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                {getPubTypeData().map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px" }}>
                    <div style={{ width: "12px", height: "12px", backgroundColor: COLORS[index % COLORS.length], borderRadius: "3px" }} />
                    <span style={{ color: "#c8b6bd" }}>{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="dashboard-box" style={{ margin: 0, height: "100%" }}>
              <h2>Project Budgets ($)</h2>
              <div style={{ width: "100%", height: "240px" }}>
                <ResponsiveContainer>
                  <BarChart data={getProjectBudgetData()} layout="vertical">
                    <XAxis type="number" stroke="#c8b6bd" />
                    <YAxis dataKey="name" type="category" width={80} stroke="#c8b6bd" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#050812", borderColor: "#6b2639" }} />
                    <Bar dataKey="budget" fill="#c1123f" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="dashboard-box" style={{ margin: 0 }}>
            <h2>Collaboration Network Stats</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", color: "#c8b6bd" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Researchers:</span>
                <strong style={{ color: "white" }}>{researchers.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Connected Institutions:</span>
                <strong style={{ color: "white" }}>{institutions.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Active Collaborations:</span>
                <strong style={{ color: "white" }}>{collaborations.filter(c => c.status === "Active").length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Publications:</span>
                <strong style={{ color: "white" }}>{publications.length}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Reports;
