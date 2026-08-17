import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserTie,
  FaUniversity,
  FaBook,
  FaUserClock,
  FaClipboardCheck,
  FaQuoteRight,
  FaHandshake,
  FaHistory,
  FaChartBar,
  FaSyncAlt,
} from "react-icons/fa";

const menuStyle = {
  padding: "15px 25px",
  color: "#fff",
  fontSize: "15px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  marginBottom: "3px",
};

function SystemAdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    researchers: 0,
    institutions: 0,
    publications: 0,
    pendingRoleRequests: 0,
    pendingReviews: 0,
    citations: 0,
    activeCollaborations: 0,
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/dashboard/super-admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();

      setStats({
        users: data.total_users || 0,
        researchers: data.total_researchers || 0,
        institutions: data.total_institutions || 0,
        publications: data.total_publications || 0,
        pendingRoleRequests: data.pending_role_requests || 0,
        pendingReviews: data.pending_reviews || 0,
        citations: data.total_citations || 0,
        activeCollaborations: data.active_collaborations || 0,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Users",
      subtitle: "Registered Users",
      value: stats.users,
      icon: <FaUsers />,
    },
    {
      title: "Total Researchers",
      subtitle: "Research Community",
      value: stats.researchers,
      icon: <FaUserTie />,
    },
    {
      title: "Total Institutions",
      subtitle: "Registered Institutions",
      value: stats.institutions,
      icon: <FaUniversity />,
    },
    {
      title: "Total Publications",
      subtitle: "Research Publications",
      value: stats.publications,
      icon: <FaBook />,
    },
    {
      title: "Pending Role Requests",
      subtitle: "Role Approval Requests",
      value: stats.pendingRoleRequests,
      icon: <FaUserClock />,
    },
    {
      title: "Pending Reviews",
      subtitle: "Publication Reviews",
      value: stats.pendingReviews,
      icon: <FaClipboardCheck />,
    },
    {
      title: "Total Citations",
      subtitle: "Research Citations",
      value: stats.citations,
      icon: <FaQuoteRight />,
    },
    {
      title: "Active Collaborations",
      subtitle: "Ongoing Collaborations",
      value: stats.activeCollaborations,
      icon: <FaHandshake />,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        display: "flex",
      }}
    >
      {/* ================= SIDEBAR ================= */}
      <div
        style={{
          width: "200px",
          minHeight: "100vh",
          background: "#0f0f0f",
          borderRight: "1px solid #292929",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            color: "#ff3038",
            textAlign: "center",
            fontSize: "22px",
            marginTop: "28px",
            marginBottom: "35px",
          }}
        >
          MENU
        </h2>

        {/* Dashboard */}
        <div
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          style={menuStyle}
        >
          🏠 &nbsp; Dashboard
        </div>

        {/* Researchers */}
        <div
          onClick={() => {
            window.location.href = "/researchers";
          }}
          style={menuStyle}
        >
          👥 &nbsp; Researchers
        </div>

        {/* Publications */}
        <div
          onClick={() => {
            window.location.href = "/publications";
          }}
          style={menuStyle}
        >
          📄 &nbsp; Publications
        </div>

        {/* Institutions */}
        <div
          onClick={() => {
            window.location.href = "/institutions";
          }}
          style={menuStyle}
        >
          🏛️ &nbsp; Institutions
        </div>

        {/* Conferences */}
        <div
          onClick={() => {
            window.location.href = "/conferences";
          }}
          style={menuStyle}
        >
          📅 &nbsp; Conferences
        </div>

        {/* Projects */}
        <div
          onClick={() => {
            window.location.href = "/projects";
          }}
          style={menuStyle}
        >
          📁 &nbsp; Projects
        </div>

        {/* Teams */}
        <div
          onClick={() => {
            window.location.href = "/teams";
          }}
          style={menuStyle}
        >
          👥 &nbsp; Teams
        </div>

        {/* Project Assignments */}
        <div
          onClick={() => {
            window.location.href = "/project-assignments";
          }}
          style={menuStyle}
        >
          📋 &nbsp; Project Assignments
        </div>

        {/* Citations */}
        <div
          onClick={() => {
            window.location.href = "/citations";
          }}
          style={menuStyle}
        >
          ❝ &nbsp; Citations
        </div>

        {/* References */}
        <div
          onClick={() => {
            window.location.href = "/references";
          }}
          style={menuStyle}
        >
          🔗 &nbsp; References
        </div>

        {/* Institution Collaborations */}
        <div
          onClick={() => {
            window.location.href = "/institution-collaborations";
          }}
          style={menuStyle}
        >
          🤝 &nbsp; Collaborations
        </div>

        {/* Collaboration Graph */}
        <div
          onClick={() => {
            window.location.href = "/collaboration-graph";
          }}
          style={menuStyle}
        >
          🔀 &nbsp; Collaboration Graph
        </div>

        {/* Reports */}
        <div
          onClick={() => {
            window.location.href = "/reports";
          }}
          style={menuStyle}
        >
          📊 &nbsp; Reports
        </div>

        {/* Audit */}
        <div
          onClick={() => {
            window.location.href = "/audit";
          }}
          style={menuStyle}
        >
          📜 &nbsp; Audit
        </div>

        {/* Logout */}
        <div
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/";
          }}
          style={{
            ...menuStyle,
            marginTop: "20px",
            marginBottom: "30px",
            color: "#ff3038",
          }}
        >
          🚪 &nbsp; Logout
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div
        style={{
          marginLeft: "200px",
          width: "calc(100% - 200px)",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ================= HEADER ================= */}
        <div
          style={{
            background: "linear-gradient(135deg, #111a2e, #16264d)",
            border: "1px solid #243a63",
            borderRadius: "16px",
            padding: "38px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "2px",
              color: "#4da3ff",
              fontWeight: "700",
              marginBottom: "12px",
            }}
          >
            SYSTEM ADMINISTRATION
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
              lineHeight: "1.2",
            }}
          >
            Scientific Collaboration
            <br />
            Network Analyzer
          </h1>

          <p
            style={{
              color: "#8ea4c7",
              marginTop: "14px",
            }}
          >
            Super Admin Dashboard
          </p>
        </div>

        {/* ================= REFRESH ================= */}
        <div style={{ marginBottom: "28px" }}>
          <button
            onClick={fetchStats}
            style={{
              background: "#ff3038",
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              padding: "11px 25px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            <FaSyncAlt style={{ marginRight: "7px" }} />
            Refresh
          </button>
        </div>

        {/* ================= TITLE ================= */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              color: "#4da3ff",
              fontSize: "11px",
              letterSpacing: "2px",
              fontWeight: "700",
            }}
          >
            SYSTEM OVERVIEW
          </div>

          <h2 style={{ margin: "7px 0 0" }}>
            Research Network Overview
          </h2>
        </div>

        {/* ================= CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                background: "#181818",
                border: "1px solid #392323",
                borderRadius: "16px",
                padding: "24px",
                minHeight: "175px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "#102344",
                  color: "#4da3ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  color: "#b8c4d8",
                  fontSize: "14px",
                }}
              >
                {card.title}
              </div>

              <div
                style={{
                  color: "#8795a9",
                  fontSize: "12px",
                  marginTop: "5px",
                }}
              >
                {card.subtitle}
              </div>

              <div
                style={{
                  color: "#ff3038",
                  fontSize: "36px",
                  fontWeight: "700",
                  marginTop: "15px",
                }}
              >
                {card.value}
              </div>

              <div
                style={{
                  color: "#18d26e",
                  fontSize: "11px",
                }}
              >
                • Live Count
              </div>
            </div>
          ))}
        </div>

        {/* ================= BOTTOM TWO SECTIONS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* AUDIT LOGS */}
          <div
            style={{
              background: "#181818",
              border: "1px solid #392323",
              borderRadius: "16px",
              padding: "25px",
              minHeight: "220px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <FaHistory
                style={{
                  color: "#4da3ff",
                  fontSize: "22px",
                }}
              />

              <div>
                <h3 style={{ margin: 0 }}>
                  System Activity
                </h3>

                <span
                  style={{
                    color: "#8795a9",
                    fontSize: "12px",
                  }}
                >
                  Recent Audit Logs
                </span>
              </div>
            </div>

            <p
              style={{
                color: "#8795a9",
                textAlign: "center",
                padding: "35px 0",
              }}
            >
              Recent system activities will appear here.
            </p>
          </div>

          {/* ANALYTICS */}
          <div
            style={{
              background: "#181818",
              border: "1px solid #392323",
              borderRadius: "16px",
              padding: "25px",
              minHeight: "220px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <FaChartBar
                style={{
                  color: "#4da3ff",
                  fontSize: "22px",
                }}
              />

              <div>
                <h3 style={{ margin: 0 }}>
                  Overall Research Analytics
                </h3>

                <span
                  style={{
                    color: "#8795a9",
                    fontSize: "12px",
                  }}
                >
                  Research Network Statistics
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid #292929",
              }}
            >
              <span>Publications</span>

              <strong style={{ color: "#ff3038" }}>
                {stats.publications}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid #292929",
              }}
            >
              <span>Citations</span>

              <strong style={{ color: "#ff3038" }}>
                {stats.citations}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0",
              }}
            >
              <span>Active Collaborations</span>

              <strong style={{ color: "#ff3038" }}>
                {stats.activeCollaborations}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemAdminDashboard;