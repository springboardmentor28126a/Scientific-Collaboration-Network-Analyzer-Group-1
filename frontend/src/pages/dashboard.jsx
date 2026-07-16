import "../css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { LayoutDashboard, Users, BookOpen, Calendar, Building2, UserCircle, LogOut, UploadCloud } from "lucide-react";

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        total_institutions: 0,
        total_researchers: 0,
        total_publications: 0,
        total_conferences: 0,
        recent_publications: [],
        recent_conferences: [],
        my_institution: "Not Assigned"
    });

    useEffect(() => {
        const getProfileAndStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [profileRes, statsRes] = await Promise.all([
                    API.get("/profile", config),
                    API.get("/dashboard-stats", config)
                ]);

                setUser(profileRes.data.user);
                setStats(statsRes.data);
            } catch (error) {
                console.log(error);
                navigate("/login");
            }
        };

        getProfileAndStats();
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="brand">
                    <h2><LayoutDashboard /> SCNA</h2>
                </div>
                <nav className="nav-menu">
                    <button onClick={() => navigate("/dashboard")} className="active"><LayoutDashboard /> Dashboard</button>
                    <button onClick={() => navigate("/researcher")}><UserCircle /> My Profile</button>
                    <button onClick={() => navigate("/publication")}><BookOpen /> Publications</button>
                    <button onClick={() => navigate("/conference")}><Calendar /> Conferences</button>
                    <button onClick={() => navigate("/institution")}><Building2 /> Institutions</button>
                    <button onClick={() => navigate("/upload")}><UploadCloud /> Upload Documents</button>
                    <button disabled className="disabled-nav">Collaborations (Soon)</button>
                </nav>
                <div className="sidebar-bottom">
                    <button className="logout-btn" onClick={logout}><LogOut /> Logout</button>
                </div>
            </aside>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Scientific Collaboration Network Analyzer</h1>
                    {user && (
                        <div className="user-info">
                            <span>Welcome, <b>{user.name}</b></span>
                            <span className="inst-badge">{stats.my_institution}</span>
                        </div>
                    )}
                </header>

                <section className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><Building2 size={32} /></div>
                        <div className="stat-details">
                            <h3>Total Institutions</h3>
                            <p>{stats.total_institutions}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><Users size={32} /></div>
                        <div className="stat-details">
                            <h3>Total Researchers</h3>
                            <p>{stats.total_researchers}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><BookOpen size={32} /></div>
                        <div className="stat-details">
                            <h3>My Publications</h3>
                            <p>{stats.total_publications}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><Calendar size={32} /></div>
                        <div className="stat-details">
                            <h3>My Conferences</h3>
                            <p>{stats.total_conferences}</p>
                        </div>
                    </div>
                </section>

                <section className="recent-activity">
                    <div className="activity-card">
                        <h3>Recent Publications</h3>
                        {stats.recent_publications.length > 0 ? (
                            <ul className="activity-list">
                                {stats.recent_publications.map((p, i) => (
                                    <li key={i}>
                                        <span className="activity-title">{p.title}</span>
                                        <span className="activity-meta">{p.year}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state">No publications found.</p>
                        )}
                    </div>

                    <div className="activity-card">
                        <h3>Recent Conferences</h3>
                        {stats.recent_conferences.length > 0 ? (
                            <ul className="activity-list">
                                {stats.recent_conferences.map((c, i) => (
                                    <li key={i}>
                                        <span className="activity-title">{c.name}</span>
                                        <span className="activity-meta">{c.date}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state">No conferences found.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Dashboard;