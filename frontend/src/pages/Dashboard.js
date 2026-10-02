import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

import PublicationStatusChart from "../charts/PublicationStatusChart";
import PublicationYearChart from "../charts/PublicationYearChart";

function Dashboard() {
  const [stats, setStats] = useState({
    researchers: 0,
    publications: 0,
    conferences: 0,
    collaborations: 0,
    projects: 0,
    institutions: 0,
    reviews: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await API.get("/report/summary");

      setStats({
        researchers: response.data.total_researchers,
        publications: response.data.total_publications,
        conferences: response.data.total_conferences,
        collaborations: response.data.total_collaborations,
        projects: response.data.total_projects,
        institutions: response.data.total_institutions || 0,
        reviews: response.data.total_reviews || 0,
      });
    } catch (error) {
      console.log("Failed to load dashboard", error);
    }
  };

  const menuStyle = {
    display: "block",
    color: "#ffffff",
    textDecoration: "none",
    padding: "11px 15px",
    marginBottom: "5px",
    borderRadius: "7px",
    fontSize: "14px",
  };

  const cardStyle = {
    flex: "1 1 200px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "22px",
    boxShadow: "0 3px 12px rgba(0, 80, 160, 0.10)",
    borderLeft: "5px solid #1976d2",
  };

  const actionStyle = {
    padding: "11px 18px",
    borderRadius: "7px",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    background: "#1976d2",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "calc(100vh - 56px)",
        background: "#f4f8ff",
      }}
    >
      {/* ================= SIDEBAR ================= */}

      <aside
        style={{
          width: "235px",
          background: "#0d47a1",
          color: "#ffffff",
          padding: "25px 14px",
          flexShrink: 0,
          boxShadow: "3px 0 10px rgba(0,0,0,0.10)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            paddingBottom: "25px",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            marginBottom: "20px",
          }}
        >
          <div style={{ fontSize: "28px" }}>🔬</div>

          <h3
            style={{
              margin: "8px 0 0",
              fontSize: "18px",
              lineHeight: "1.3",
            }}
          >
            Scientific
            <br />
            Collaboration
          </h3>

          <small style={{ color: "#bbdefb" }}>
            Network Analyzer
          </small>
        </div>

        <div
          style={{
            color: "#90caf9",
            fontSize: "11px",
            fontWeight: "bold",
            margin: "18px 10px 8px",
          }}
        >
          MAIN
        </div>

        <Link
          to="/dashboard"
          style={{
            ...menuStyle,
            background: "#1976d2",
          }}
        >
          📊 Dashboard
        </Link>

        <div
          style={{
            color: "#90caf9",
            fontSize: "11px",
            fontWeight: "bold",
            margin: "22px 10px 8px",
          }}
        >
          RESEARCH
        </div>

        <Link to="/researcher" style={menuStyle}>
          👨‍🔬 Researchers
        </Link>

        <Link to="/publication" style={menuStyle}>
          📄 Publications
        </Link>

        <Link to="/conference" style={menuStyle}>
          🎤 Conferences
        </Link>

        <Link to="/institution" style={menuStyle}>
          🏛 Institutions
        </Link>

        <div
          style={{
            color: "#90caf9",
            fontSize: "11px",
            fontWeight: "bold",
            margin: "22px 10px 8px",
          }}
        >
          COLLABORATION
        </div>

        <Link to="/collaboration" style={menuStyle}>
          🤝 Collaborations
        </Link>

        <Link to="/project" style={menuStyle}>
          📁 Projects
        </Link>

        <Link to="/citation" style={menuStyle}>
          📚 Citations
        </Link>

        <div
          style={{
            color: "#90caf9",
            fontSize: "11px",
            fontWeight: "bold",
            margin: "22px 10px 8px",
          }}
        >
          REVIEW
        </div>

        <Link to="/reviewqueue" style={menuStyle}>
          📝 Review Queue
        </Link>

        <Link to="/myreviews" style={menuStyle}>
          ⭐ My Reviews
        </Link>

        <Link to="/notification" style={menuStyle}>
          🔔 Notifications
        </Link>

        <Link
          to="/"
          style={{
            ...menuStyle,
            background: "#1565c0",
            marginTop: "25px",
          }}
        >
          🚪 Logout
        </Link>
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main
        style={{
          flex: 1,
          padding: "30px",
          overflowX: "hidden",
        }}
      >
        {/* TOP HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#ffffff",
            padding: "18px 25px",
            borderRadius: "12px",
            marginBottom: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#123",
                fontSize: "27px",
              }}
            >
              Welcome back 👋
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: "#6c757d",
              }}
            >
              Scientific Collaboration Network Analyzer
            </p>
          </div>

          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "#e3f2fd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            👤
          </div>
        </div>

        {/* DESCRIPTION */}

        <div style={{ marginBottom: "22px" }}>
          <p style={{ color: "#607d8b", margin: 0 }}>
            Track researchers, publications, collaborations, projects,
            conferences and research activities from one place.
          </p>
        </div>

        {/* ================= STAT CARDS ================= */}

        <div
          style={{
            display: "flex",
            gap: "18px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <div style={cardStyle}>
            <div style={{ color: "#1976d2", fontSize: "14px" }}>
              👨‍🔬 Total Researchers
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#0d47a1",
                marginTop: "8px",
              }}
            >
              {stats.researchers}
            </div>

            <small style={{ color: "#78909c" }}>
              Registered researchers
            </small>
          </div>

          <div
            style={{
              ...cardStyle,
              borderLeftColor: "#2196f3",
            }}
          >
            <div style={{ color: "#1976d2", fontSize: "14px" }}>
              📄 Total Publications
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#0d47a1",
                marginTop: "8px",
              }}
            >
              {stats.publications}
            </div>

            <small style={{ color: "#78909c" }}>
              Research publications
            </small>
          </div>

          <div
            style={{
              ...cardStyle,
              borderLeftColor: "#42a5f5",
            }}
          >
            <div style={{ color: "#1976d2", fontSize: "14px" }}>
              🤝 Collaborations
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#0d47a1",
                marginTop: "8px",
              }}
            >
              {stats.collaborations}
            </div>

            <small style={{ color: "#78909c" }}>
              Research collaborations
            </small>
          </div>

          <div
            style={{
              ...cardStyle,
              borderLeftColor: "#64b5f6",
            }}
          >
            <div style={{ color: "#1976d2", fontSize: "14px" }}>
              📁 Projects
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#0d47a1",
                marginTop: "8px",
              }}
            >
              {stats.projects}
            </div>

            <small style={{ color: "#78909c" }}>
              Research projects
            </small>
          </div>
        </div>

        {/* ================= SECONDARY CARDS ================= */}

        <div
          style={{
            display: "flex",
            gap: "18px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              ...cardStyle,
              borderLeftColor: "#90caf9",
            }}
          >
            <div style={{ color: "#1976d2" }}>
              🏛 Institutions
            </div>

            <div
              style={{
                fontSize: "27px",
                fontWeight: "700",
                color: "#0d47a1",
                marginTop: "6px",
              }}
            >
              {stats.institutions}
            </div>
          </div>

          <div
            style={{
              ...cardStyle,
              borderLeftColor: "#90caf9",
            }}
          >
            <div style={{ color: "#1976d2" }}>
              🎤 Conferences
            </div>

            <div
              style={{
                fontSize: "27px",
                fontWeight: "700",
                color: "#0d47a1",
                marginTop: "6px",
              }}
            >
              {stats.conferences}
            </div>
          </div>

          <div
            style={{
              ...cardStyle,
              borderLeftColor: "#90caf9",
            }}
          >
            <div style={{ color: "#1976d2" }}>
              📝 Reviews
            </div>

            <div
              style={{
                fontSize: "27px",
                fontWeight: "700",
                color: "#0d47a1",
                marginTop: "6px",
              }}
            >
              {stats.reviews}
            </div>
          </div>
        </div>

        {/* ================= ANALYTICS ================= */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "25px",
            marginBottom: "25px",
            boxShadow: "0 3px 12px rgba(0,80,160,0.08)",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #e3f2fd",
              paddingBottom: "12px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#0d47a1",
                fontSize: "21px",
              }}
            >
              📊 Publication Analytics
            </h2>

            <small style={{ color: "#78909c" }}>
              Publication status and yearly publication overview
            </small>
          </div>

          <div
            style={{
              display: "flex",
              gap: "50px",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <PublicationStatusChart />

            <PublicationYearChart />
          </div>
        </div>

        {/* ================= QUICK ACTIONS ================= */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 3px 12px rgba(0,80,160,0.08)",
          }}
        >
          <h2
            style={{
              color: "#0d47a1",
              marginTop: 0,
            }}
          >
            Quick Actions
          </h2>

          <p style={{ color: "#78909c" }}>
            Quickly access commonly used research management functions.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            <Link to="/add-researcher" style={actionStyle}>
              + Add Researcher
            </Link>

            <Link to="/add-publication" style={actionStyle}>
              + Add Publication
            </Link>

            <Link to="/add-project" style={actionStyle}>
              + Add Project
            </Link>

            <Link
              to="/reviewqueue"
              style={{
                ...actionStyle,
                background: "#0d47a1",
              }}
            >
              📝 Review Queue
            </Link>
          </div>
        </div>

        {/* FOOTER */}

        <div
          style={{
            textAlign: "center",
            padding: "25px 0 10px",
            color: "#90a4ae",
            fontSize: "13px",
          }}
        >
          Scientific Collaboration Network Analyzer © 2026
        </div>
      </main>
    </div>
  );
}

export default Dashboard;