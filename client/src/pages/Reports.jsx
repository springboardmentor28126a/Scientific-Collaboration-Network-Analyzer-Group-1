import { useState } from "react";
import API from "../services/api";
import { getAuthUser } from "../utils/authStorage";

const reportOptions = {
    Researcher: [["researcher", "Researcher Report"], ["publication", "Publication Report"], ["collaboration", "Collaboration Report"]],
    Reviewer: [["researcher", "Researcher Report"], ["publication", "Publication Report"], ["review", "Review Report"], ["institution", "Institution Report"], ["collaboration", "Collaboration Report"]],
    "Institution Admin": [["researcher", "Researcher Report"], ["publication", "Publication Report"], ["institution", "Institution Report"]],
    "System Admin": [["researcher", "Researcher Report"], ["publication", "Publication Report"], ["review", "Review Report"], ["institution", "Institution Report"], ["collaboration", "Collaboration Report"], ["system", "System Report"]],
};

export default function Reports() {
    const user = getAuthUser();
    const options = reportOptions[user?.role] || reportOptions.Researcher;
    const [reportType, setReportType] = useState(options[0][0]);
    const [status, setStatus] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [loading, setLoading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState("");
    const [error, setError] = useState("");

    const generate = async () => {
        setLoading(true); setError(""); setDownloadUrl("");
        try {
            const response = await API.get("/reports/csv", { params: { report_type: reportType, status: status || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined }, responseType: "blob" });
            setDownloadUrl(URL.createObjectURL(response.data));
        } catch (requestError) {
            setError(requestError.response?.data?.detail || "Unable to generate this report.");
        } finally { setLoading(false); }
    };

    return <section className="page-container"><h1>Reports</h1><p style={{ color: "var(--muted)" }}>Generate current SCNA data within your role permissions.</p><div className="card-surface" style={{ padding: "24px", maxWidth: "760px" }}><label>Report type<select value={reportType} onChange={(event) => setReportType(event.target.value)} style={{ display: "block", width: "100%", marginTop: "8px" }}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "18px" }}><label>From<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label><label>To<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option>Draft</option><option>Submitted</option><option>Pending Review</option><option>Published</option><option>Rejected</option></select></label></div><button type="button" onClick={generate} disabled={loading} style={{ marginTop: "20px" }}>{loading ? "Generating..." : "Generate Report"}</button>{error && <p className="server-error">{error}</p>}{downloadUrl && <div style={{ marginTop: "18px" }}><p>Report ready.</p><a className="button" href={downloadUrl} download={`scna-${reportType}-report.csv`}>Download CSV</a></div>}</div></section>;
}
