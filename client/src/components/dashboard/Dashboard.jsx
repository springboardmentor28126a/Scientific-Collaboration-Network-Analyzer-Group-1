import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    const [verification, setVerification] = useState(null);
    const [overview, setOverview] = useState({ stats: {}, activity: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [verificationResponse, overviewResponse] = await Promise.all([
                    API.get("/verification/status"),
                    API.get("/dashboard/overview"),
                ]);
                setVerification(verificationResponse.data);
                setOverview(overviewResponse.data);
            } catch (error) {
                console.error("Unable to load dashboard", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    const cards = [
        ["📚", "Publications", overview.stats.publications],
        ["🤝", "Collaborations", overview.stats.collaborations],
        ["📅", "Meetings", overview.stats.meetings],
        ["👥", "Research Groups", overview.stats.groups],
        ["⭐", "Citations", overview.stats.citations],
        ["🔔", "Unread Notifications", overview.stats.notifications],
    ];

    return (
        <div className="page-container">
            <div style={headerStyle}>
                <div>
                    <h1>Welcome, {user?.name || "Researcher"} 👋</h1>
                    <p style={{ marginTop: "8px" }}>{user?.role}</p>
                </div>
                <span style={verificationStyle(verification?.status)}>
                    {verification?.status === "Approved" ? "● Verified" : verification?.status || "Verification pending"}
                </span>
            </div>

            <div style={cardsStyle}>
                {cards.map(([icon, label, value]) => (
                    <div key={label} className="card-surface" style={cardStyle}>
                        <span style={{ fontSize: "26px" }}>{icon}</span>
                        <p style={{ marginTop: "14px" }}>{label}</p>
                        <h2 style={{ marginTop: "8px", fontSize: "30px" }}>{loading ? "–" : value ?? 0}</h2>
                    </div>
                ))}
            </div>

            <section className="card-surface" style={{ marginTop: "24px", padding: "24px" }}>
                <h2>Recent Activity</h2>
                <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
                    {overview.activity.length === 0 && !loading && <p>No recent activity yet.</p>}
                    {overview.activity.map((event) => (
                        <div key={event.id} style={activityStyle}>
                            <span style={{ color: "var(--accent)" }}>●</span>
                            <div>
                                <p style={{ color: "var(--text)" }}>{event.description}</p>
                                <small style={{ color: "var(--muted)" }}>{new Date(event.created_at).toLocaleString()}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" };
const cardsStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px", marginTop: "28px" };
const cardStyle = { padding: "20px", minHeight: "140px" };
const activityStyle = { display: "flex", gap: "12px", padding: "14px 0", borderBottom: "1px solid var(--border)" };
const verificationStyle = (status) => ({
    color: status === "Approved" ? "#22c55e" : status === "Rejected" ? "#ef4444" : "#f59e0b",
    fontWeight: 700,
});
