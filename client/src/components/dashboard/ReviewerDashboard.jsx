import { useEffect, useState } from "react";
import { FaBookOpen, FaCheckCircle, FaClock, FaUsers, FaUserCheck } from "react-icons/fa";
import API from "../../services/api";
import { getAuthUser } from "../../utils/authStorage";

const cardIcons = { researchers: FaUsers, reviewers: FaUserCheck, publications: FaBookOpen, pending_reviews: FaClock, completed_reviews: FaCheckCircle };

export default function ReviewerDashboard() {
    const user = getAuthUser();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        API.get("/reviewer/overview").then(({ data: response }) => setData(response)).catch(() => setError("Reviewer overview is temporarily unavailable."));
    }, []);

    if (error) return <section className="page-container"><h1>Reviewer Dashboard</h1><p className="server-error">{error}</p></section>;
    if (!data) return <section className="page-container"><h1>Reviewer Dashboard</h1><p>Loading your review overview...</p></section>;

    const stats = data.stats || {};
    return <section className="page-container">
        <div style={{ marginBottom: "24px" }}><h1>Reviewer Dashboard</h1><p style={{ color: "var(--muted)" }}>Welcome back, {user?.name}. Track your assigned reviews and the wider research network.</p></div>
        <div className="dashboard-grid">
            {[["researchers", "Researchers"], ["reviewers", "Reviewers"], ["publications", "Publications"], ["pending_reviews", "Pending Reviews"], ["completed_reviews", "Completed Reviews"]].map(([key, label]) => { const Icon = cardIcons[key]; return <div className="card" key={key}><Icon style={{ color: "var(--accent)", fontSize: "22px" }} /><h2>{stats[key] ?? 0}</h2><p>{label}</p></div>; })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "20px", marginTop: "24px" }}>
            <OverviewPanel title="Review Overview" items={data.pending_reviews} empty="No pending reviews" action="Review" onAction={(item) => window.location.assign(`/publication/${item.id}`)} />
            <OverviewPanel title="Recently Reviewed" items={data.recently_reviewed} empty="No reviews completed yet" />
            <OverviewPanel title="Recent Publications" items={data.recent_publications} empty="No publication activity yet" />
            <OverviewPanel title="Recent Notifications" items={data.notifications} empty="No relevant notifications" />
        </div>
        <div className="card-surface" style={{ marginTop: "24px", padding: "22px" }}><h2>Publication Health</h2><div style={{ display: "flex", gap: "18px", flexWrap: "wrap", color: "var(--muted)" }}><span>Approved publications: <strong>{stats.approved_publications ?? 0}</strong></span><span>Awaiting review: <strong>{stats.pending_publications ?? 0}</strong></span></div></div>
    </section>;
}

function OverviewPanel({ title, items = [], empty, action, onAction }) {
    return <div className="card-surface" style={{ padding: "22px" }}><h2>{title}</h2>{items.length === 0 ? <p style={{ color: "var(--muted)" }}>{empty}</p> : items.map((item) => <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}><strong>{item.title || item.message}</strong><br /><small style={{ color: "var(--muted)" }}>{item.authors || item.status || new Date(item.created_at).toLocaleString()}</small>{action && <button type="button" onClick={() => onAction(item)} style={{ display: "block", marginTop: "8px" }}>{action}</button>}</div>)}</div>;
}
