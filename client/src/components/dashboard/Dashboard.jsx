import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { FaBookOpen, FaUsers, FaUniversity, FaCalendarAlt, FaUserFriends, FaBell, FaTrophy, FaFire, FaUserCheck } from "react-icons/fa";
import { getAuthUser } from "../../utils/authStorage";

export default function Dashboard() {
    const user = getAuthUser();
    const navigate = useNavigate();
    const [verification, setVerification] = useState(null);
    const [overview, setOverview] = useState({ stats: {}, activity: [], sections: {} });
    const [loading, setLoading] = useState(true);
    const [expandedSection, setExpandedSection] = useState(null);

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

    const sections = overview.sections || {};
    const cards = [
        ["publications", <FaBookOpen />, "My Publications", overview.stats.publications],
        ["groups", <FaUsers />, "My Research Groups", overview.stats.groups],
        ["conferences", <FaUniversity />, "My Conferences", sections.conferences?.length || 0],
        ["meetings", <FaCalendarAlt />, "My Meetings", overview.stats.meetings],
        ["collaborations", <FaUserFriends />, "My Collaborations", overview.stats.collaborations],
        ["notifications", <FaBell />, "My Notifications", overview.stats.notifications],
    ];

    return (
        <div className="page-container">
            <div style={headerStyle}>
                <div>
                    <h1>Welcome, {user?.name || "Researcher"}</h1>
                    <p style={{ marginTop: "8px" }}>{user?.role}</p>
                </div>
                <span style={verificationStyle(verification?.status)}>
                    {verification?.status === "Approved" ? "● Verified" : verification?.status || "Verification pending"}
                </span>
            </div>

            <div style={cardsStyle}>
                {cards.map(([key, icon, label, value]) => (
                    <button
                        key={key}
                        type="button"
                        className={`card-surface dashboard-card-button ${expandedSection === key ? "is-expanded" : ""}`}
                        style={cardStyle}
                        onClick={() => setExpandedSection((current) => current === key ? null : key)}
                        aria-expanded={expandedSection === key}
                    >
                        <span style={{ fontSize: "26px" }}>{icon}</span>
                        <p style={{ marginTop: "14px" }}>{label}</p>
                        <h2 style={{ marginTop: "8px", fontSize: "30px" }}>{loading ? "–" : value ?? 0}</h2>
                        <small className="dashboard-card-hint">{expandedSection === key ? "Hide details" : "View details"}</small>
                    </button>
                ))}
            </div>

            {expandedSection && <DashboardDetail section={expandedSection} overview={overview} onNavigate={navigate} />}

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

            <section className="dashboard-leaderboards">
                <Leaderboard title="Top Researchers" icon={<FaTrophy />} items={overview.leaderboards?.researchers} />
                <Leaderboard title="Top Institutions" icon={<FaUniversity />} items={overview.leaderboards?.institutions} />
                <Leaderboard title="Top Reviewers" icon={<FaUserCheck />} items={overview.leaderboards?.reviewers} suffix="reviews" />
                <Leaderboard title="Trending Topics" icon={<FaFire />} items={overview.trending_topics} nameKey="topic" suffix="mentions" />
            </section>
            <section className="card-surface leaderboard-card" style={{ marginTop: "18px" }}>
                <h2>Latest Publications</h2>
                {(overview.latest_publications || []).map((item) => <div className="leaderboard-row" key={item.id}><strong>{item.title}</strong><span>{item.year || "—"} · {item.status}</span></div>)}
            </section>
        </div>
    );
}

function DashboardDetail({ section, overview, onNavigate }) {
    const items = overview.sections?.[section] || [];
    const title = {
        publications: "Recent publications",
        groups: "My research groups",
        conferences: "My conferences",
        meetings: "Upcoming meetings",
        collaborations: "Collaboration activity",
        notifications: "Recent notifications",
    }[section] || "Details";

    return (
        <section className="dashboard-detail card-surface" aria-live="polite">
            <div className="dashboard-detail-heading">
                <div><span className="eyebrow">Personal workspace</span><h2>{title}</h2></div>
                {section === "publications" && <button onClick={() => onNavigate("/publications")}>Manage publications</button>}
                {section === "groups" && <button onClick={() => onNavigate("/groups")}>Explore groups</button>}
                {section === "notifications" && <button onClick={() => onNavigate("/notifications")}>Open notifications</button>}
            </div>
            {items.length === 0 ? (
                <div className="empty-state"><strong>No activity here yet</strong><span>Your personal workspace will appear here as you use SCNA.</span></div>
            ) : (
                <div className="dashboard-detail-list">
                    {items.map((item) => (
                        <div className="dashboard-detail-row" key={item.id}>
                            <div><strong>{item.title || item.name || item.message}</strong><small>{item.status || item.description || item.location || item.date || ""}</small></div>
                            {item.reviewed_at && <span className="status-badge">Reviewed</span>}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function Leaderboard({ title, icon, items = [], nameKey = "name", suffix = "publications" }) {
    return (
        <section className="card-surface leaderboard-card">
            <h2 className="section-title-with-icon">{icon}<span>{title}</span></h2>
            {items.length === 0 ? <p>No ranking data yet.</p> : items.map((item, index) => (
                <div className="leaderboard-row" key={`${item.name}-${index}`}>
                    <span className="leaderboard-rank">{index + 1}</span>
                    <strong>{item[nameKey]}</strong>
                    <span>{item.publications ?? item.count} {suffix}</span>
                </div>
            ))}
        </section>
    );
}

const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" };
const cardsStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px", marginTop: "28px" };
const cardStyle = { padding: "20px", minHeight: "140px", textAlign: "left" };
const activityStyle = { display: "flex", gap: "12px", padding: "14px 0", borderBottom: "1px solid var(--border)" };
const verificationStyle = (status) => ({ color: status === "Approved" ? "#22c55e" : status === "Rejected" ? "#ef4444" : "#f59e0b", fontWeight: 700 });
