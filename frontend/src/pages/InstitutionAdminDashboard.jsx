import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaBook,
  FaQuoteRight,
  FaHandshake,
  FaClipboardList,
  FaCalendarAlt,
  FaChartBar,
  FaSync,
} from "react-icons/fa";

import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

function InstitutionAdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    researchers: 0,
    publications: 0,
    citations: 0,
    collaborations: 0,
    pendingRequests: 0,
    conferences: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        researchers,
        publications,
        citations,
        collaborations,
        pendingCollaborations,
        conferences,
      ] = await Promise.all([
        api.get("/researchers/"),
        api.get("/papers/"),
        api.get("/citations/"),
        api.get("/institution-collaborations/"),
        api.get("/institution-collaborations/pending"),
        api.get("/conferences/"),
      ]);

      setStats({
        researchers: Array.isArray(researchers.data)
          ? researchers.data.length
          : 0,

        publications: Array.isArray(publications.data)
          ? publications.data.length
          : 0,

        citations: Array.isArray(citations.data)
          ? citations.data.length
          : 0,

        collaborations: Array.isArray(collaborations.data)
          ? collaborations.data.filter(
              (item) => item.status === "Accepted"
            ).length
          : 0,

        pendingRequests: Array.isArray(pendingCollaborations.data)
          ? pendingCollaborations.data.length
          : 0,

        conferences: Array.isArray(conferences.data)
          ? conferences.data.length
          : 0,
      });
    } catch (error) {
      console.error(
        "Error loading Institution Admin dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = [
    {
      title: "Researchers in Institution",
      subtitle: "Institution Researchers",
      value: stats.researchers,
      icon: <FaUsers />,
      path: "/researchers",
    },

    {
      title: "Institution Publications",
      subtitle: "Research Publications",
      value: stats.publications,
      icon: <FaBook />,
      path: "/publications",
    },

    {
      title: "Institution Citations",
      subtitle: "Total Citations",
      value: stats.citations,
      icon: <FaQuoteRight />,
      path: "/citations",
    },

    {
      title: "Active Collaborations",
      subtitle: "Accepted Collaborations",
      value: stats.collaborations,
      icon: <FaHandshake />,
      path: "/institution-collaborations",
    },

    {
      title: "Pending Requests",
      subtitle: "Pending Collaboration Requests",
      value: stats.pendingRequests,
      icon: <FaClipboardList />,
      path: "/institution-collaborations",
    },

    {
      title: "Upcoming Conferences",
      subtitle: "Institution Conferences",
      value: stats.conferences,
      icon: <FaCalendarAlt />,
      path: "/conferences",
    },

    {
      title: "Research / Publication Analytics",
      subtitle: "Research Statistics & Analytics",
      value: "View",
      icon: <FaChartBar />,
      path: "/reports",
    },
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: "0 0 30px 0" }}>

        {/* HEADER */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#111827,#172554)",
            border: "1px solid #263b63",
            borderRadius: "16px",
            padding: "40px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              color: "#60a5fa",
              fontSize: "12px",
              fontWeight: "bold",
              letterSpacing: "2px",
              marginBottom: "12px",
            }}
          >
            INSTITUTION ADMIN WORKSPACE
          </div>

          <h1
            style={{
              color: "white",
              fontSize: "38px",
              margin: "0 0 10px 0",
            }}
          >
            Scientific Collaboration
            <br />
            Network Analyzer
          </h1>

          <p
            style={{
              color: "#93c5fd",
              fontSize: "16px",
              margin: 0,
            }}
          >
            Institution Admin Dashboard
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/researchers")}
            style={buttonStyle}
          >
            <FaUsers /> Researchers
          </button>

          <button
            onClick={() => navigate("/publications")}
            style={buttonStyle}
          >
            <FaBook /> Publications
          </button>

          <button
            onClick={() =>
              navigate("/institution-collaborations")
            }
            style={buttonStyle}
          >
            <FaHandshake /> Collaborations
          </button>

          <button
            onClick={loadDashboard}
            style={buttonStyle}
          >
            <FaSync /> Refresh
          </button>
        </div>

        {/* OVERVIEW */}
        <div
          style={{
            color: "#60a5fa",
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "2px",
          }}
        >
          INSTITUTION OVERVIEW
        </div>

        <h2
          style={{
            color: "white",
            marginTop: "8px",
            marginBottom: "18px",
          }}
        >
          Research & Collaboration Overview
        </h2>

        {/* STAT CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(240px,1fr))",
            gap: "20px",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              style={cardStyle}
            >
              <div style={iconStyle}>
                {card.icon}
              </div>

              <div
                style={{
                  color: "#d1d5db",
                  fontSize: "15px",
                  marginBottom: "5px",
                }}
              >
                {card.title}
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                {card.subtitle}
              </div>

              <div
                style={{
                  color: "#ff3030",
                  fontSize: "42px",
                  fontWeight: "bold",
                  marginTop: "20px",
                }}
              >
                {loading ? "..." : card.value}
              </div>

              {card.value !== "View" && (
                <div
                  style={{
                    color: "#22c55e",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  • Live Count
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ANALYTICS */}
        <div style={{ marginTop: "35px" }}>
          <div
            style={{
              color: "#60a5fa",
              fontSize: "11px",
              fontWeight: "bold",
              letterSpacing: "2px",
            }}
          >
            ANALYTICS
          </div>

          <h2
            style={{
              color: "white",
              marginTop: "8px",
            }}
          >
            Research / Publication Analytics
          </h2>

          <div
            style={{
              background:
                "linear-gradient(135deg,#111827,#172033)",
              border: "1px solid #263b63",
              borderRadius: "14px",
              padding: "25px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/reports")}
          >
            <FaChartBar
              style={{
                color: "#60a5fa",
                fontSize: "28px",
                marginBottom: "12px",
              }}
            />

            <h3
              style={{
                color: "white",
                margin: "0 0 8px 0",
              }}
            >
              Research & Publication Reports
            </h3>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "14px",
                margin: 0,
              }}
            >
              View research activity, publication statistics,
              citation data and collaboration analytics.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

const buttonStyle = {
  background: "#ff3030",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "11px 18px",
  cursor: "pointer",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const cardStyle = {
  background: "#171717",
  border: "1px solid #3b2929",
  borderRadius: "16px",
  padding: "26px",
  cursor: "pointer",
  transition: "0.2s",
};

const iconStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "10px",
  background: "#172554",
  color: "#60a5fa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  marginBottom: "22px",
};

export default InstitutionAdminDashboard;