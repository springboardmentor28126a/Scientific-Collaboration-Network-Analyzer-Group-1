import { useCallback, useEffect, useState } from "react";
import { FaBookOpen, FaCheckCircle, FaClock, FaUsers, FaUserCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { getAuthUser } from "../../utils/authStorage";

const cardIcons = { researchers: FaUsers, reviewers: FaUserCheck, publications: FaBookOpen, pending_reviews: FaClock, completed_reviews: FaCheckCircle };

export default function ReviewerDashboard() {
    const user = getAuthUser();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");
    const [processingId, setProcessingId] = useState(null);

    const loadOverview = useCallback(async () => {
        const response = await API.get("/reviewer/overview");
        setData(response.data);
    }, []);

    useEffect(() => {
        loadOverview().catch(() => setError("Reviewer overview is temporarily unavailable."));
    }, [loadOverview]);

    const reviewPublication = async (publication, decision) => {
        const comments = window.prompt(
            decision === "approve" ? "Approval comments (optional)" : "Rejection reason",
            "",
        );
        if (comments === null) return;

        setProcessingId(`${decision}-${publication.id}`);
        setActionError("");
        setActionSuccess("");
        try {
            const response = await API.put(`/reviewer/${decision}/${publication.id}`, { review_comments: comments });
            setActionSuccess(response.data?.message || `Publication ${decision === "approve" ? "approved" : "rejected"} successfully.`);
            await loadOverview();
        } catch (requestError) {
            setActionError(requestError.response?.data?.detail || "Unable to submit the review.");
        } finally {
            setProcessingId(null);
        }
    };

    if (error) return <section className="page-container"><h1>Reviewer Dashboard</h1><p className="server-error">{error}</p></section>;
    if (!data) return <section className="page-container"><h1>Reviewer Dashboard</h1><p>Loading your review overview...</p></section>;

    const stats = data.stats || {};
    return <section className="page-container">
        <div style={{ marginBottom: "24px" }}><h1>Reviewer Dashboard</h1><p style={{ color: "var(--muted)" }}>Welcome back, {user?.name}. Track your assigned reviews and the wider research network.</p></div>
        <div className="dashboard-grid">
            {[['researchers', 'Researchers'], ['reviewers', 'Reviewers'], ['publications', 'Publications'], ['pending_reviews', 'Pending Reviews'], ['completed_reviews', 'Completed Reviews']].map(([key, label]) => { const Icon = cardIcons[key]; return <div className="card" key={key}><Icon style={{ color: "var(--accent)", fontSize: "22px" }} /><h2>{stats[key] ?? 0}</h2><p>{label}</p></div>; })}
        </div>
        {actionSuccess && <div className="reviewer-action-message reviewer-action-success" role="status">{actionSuccess}</div>}
        {actionError && <div className="reviewer-action-message reviewer-action-error" role="alert">{actionError}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "20px", marginTop: "24px" }}>
            <OverviewPanel title="Pending Reviews" items={data.pending_reviews} empty="No pending reviews" pending onView={(item) => navigate(`/publication/${item.id}`)} onReview={reviewPublication} processingId={processingId} />
            <OverviewPanel title="Recently Reviewed" items={data.recently_reviewed} empty="No reviews completed yet" onView={(item) => navigate(`/publication/${item.id}`)} />
            <OverviewPanel title="Recent Publications" items={data.recent_publications} empty="No publication activity yet" onView={(item) => navigate(`/publication/${item.id}`)} />
            <OverviewPanel title="Recent Notifications" items={data.notifications} empty="No relevant notifications" />
        </div>
        <div className="card-surface" style={{ marginTop: "24px", padding: "22px" }}><h2>Publication Health</h2><div style={{ display: "flex", gap: "18px", flexWrap: "wrap", color: "var(--muted)" }}><span>Approved publications: <strong>{stats.approved_publications ?? 0}</strong></span><span>Awaiting review: <strong>{stats.pending_publications ?? 0}</strong></span></div></div>
    </section>;
}

function OverviewPanel({ title, items = [], empty, pending, onView, onReview, processingId }) {
    return <div className="card-surface" style={{ padding: "22px" }}><h2>{title}</h2>{items.length === 0 ? <p style={{ color: "var(--muted)" }}>{empty}</p> : items.map((item) => {
        const processing = processingId === `approve-${item.id}` || processingId === `reject-${item.id}`;
        return <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <strong>{item.title || item.message}</strong>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: "5px" }}><small style={{ color: "var(--muted)" }}>{item.authors || item.status || (item.created_at ? new Date(item.created_at).toLocaleString() : "")}</small>{item.status && <span className="status-badge">{item.status}</span>}</div>
            {pending && <div className="reviewer-item-actions"><button type="button" onClick={() => onView(item)}>View Details</button><button type="button" className="primary-action" onClick={() => onReview(item, "approve")} disabled={processing}>Approve</button><button type="button" className="reviewer-reject-button" onClick={() => onReview(item, "reject")} disabled={processing}>Reject</button></div>}
            {!pending && onView && item.title && <button type="button" className="inline-action" onClick={() => onView(item)}>View Details →</button>}
        </div>;
    })}</div>;
}
