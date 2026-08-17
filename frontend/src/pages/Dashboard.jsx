import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  let userRole = "researcher";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userRole = payload.role || "researcher";
    } catch (error) {
      console.log("Invalid token");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data || {});
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardTitle = () => {
    if (userRole === "system_admin") {
      return "Super Admin Dashboard";
    }

    if (userRole === "institution_admin") {
      return "Institution Admin Dashboard";
    }

    if (userRole === "reviewer") {
      return "Reviewer Dashboard";
    }

    return "Researcher Dashboard";
  };

  const getDashboardCards = () => {

    /* =========================
       SUPER ADMIN
    ========================= */

    if (userRole === "system_admin") {
      return [
        {
          title: "Total Users",
          value: stats.users || 0,
          description: "Registered Users",
        },
        {
          title: "Total Researchers",
          value: stats.researchers || 0,
          description: "Registered Researchers",
        },
        {
          title: "Total Institutions",
          value: stats.institutions || 0,
          description: "Registered Institutions",
        },
        {
          title: "Total Publications",
          value: stats.papers || 0,
          description: "Research Publications",
        },
        {
          title: "Pending Role Requests",
          value: stats.pending_role_requests || 0,
          description: "Role Requests",
        },
        {
          title: "Pending Reviews",
          value: stats.pending_reviews || 0,
          description: "Reviews Pending",
        },
        {
          title: "Total Citations",
          value: stats.citations || 0,
          description: "Total Citations",
        },
        {
          title: "Active Collaborations",
          value: stats.active_collaborations || 0,
          description: "Active Collaborations",
        },
      ];
    }


    /* =========================
       INSTITUTION ADMIN
    ========================= */

    if (userRole === "institution_admin") {
      return [
        {
          title: "Researchers in Institution",
          value: stats.researchers || 0,
          description: "Institution Researchers",
        },
        {
          title: "Institution Publications",
          value: stats.papers || 0,
          description: "Institution Publications",
        },
        {
          title: "Institution Citations",
          value: stats.citations || 0,
          description: "Institution Citations",
        },
        {
          title: "Active Collaborations",
          value: stats.active_collaborations || 0,
          description: "Active Collaborations",
        },
        {
          title: "Pending Requests",
          value: stats.pending_requests || 0,
          description: "Pending Requests",
        },
        {
          title: "Upcoming Conferences",
          value: stats.conferences || 0,
          description: "Upcoming Conferences",
        },
      ];
    }


    /* =========================
       REVIEWER
    ========================= */

    if (userRole === "reviewer") {
      return [
        {
          title: "Pending Publication Reviews",
          value: stats.pending_publication_reviews || 0,
          description: "Publication Reviews",
        },
        {
          title: "Pending Citation Verifications",
          value: stats.pending_citation_verifications || 0,
          description: "Citation Verifications",
        },
        {
          title: "Approved Publications",
          value: stats.approved_publications || 0,
          description: "Approved",
        },
        {
          title: "Rejected Publications",
          value: stats.rejected_publications || 0,
          description: "Rejected",
        },
        {
          title: "Verified Citations",
          value: stats.verified_citations || 0,
          description: "Verified",
        },
        {
          title: "Rejected Citations",
          value: stats.rejected_citations || 0,
          description: "Rejected",
        },
      ];
    }


    /* =========================
       RESEARCHER
    ========================= */

    return [
      {
        title: "My Publications",
        value: stats.my_publications || stats.papers || 0,
        description: "Research Papers",
      },
      {
        title: "My Citations",
        value: stats.my_citations || stats.citations || 0,
        description: "Total Citations",
      },
      {
        title: "My Collaborators",
        value: stats.my_collaborators || 0,
        description: "Research Collaborators",
      },
      {
        title: "Pending Collaboration Requests",
        value: stats.pending_collaboration_requests || 0,
        description: "Pending Requests",
      },
      {
        title: "Upcoming Conferences",
        value: stats.conferences || 0,
        description: "Upcoming Conferences",
      },
      {
        title: "Publication Statistics",
        value: stats.papers || 0,
        description: "Total Publications",
      },
    ];
  };


  const cards = getDashboardCards();


  return (
    <DashboardLayout>

      <div style={{ padding: "10px" }}>

        {/* =========================
            HEADER
        ========================= */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #101a30, #162957)",
            border:
              "1px solid #263b62",
            borderRadius: "18px",
            padding: "35px",
            marginBottom: "30px",
          }}
        >

          <span
            style={{
              color: "#4da3ff",
              fontSize: "12px",
              letterSpacing: "2px",
              fontWeight: "bold",
            }}
          >
            SCIENTIFIC COLLABORATION NETWORK
          </span>

          <h1
            style={{
              color: "white",
              fontSize: "38px",
              margin: "12px 0",
            }}
          >
            {getDashboardTitle()}
          </h1>

          <p
            style={{
              color: "#94a3b8",
              margin: 0,
            }}
          >
            Scientific Collaboration Network Analyzer
          </p>

        </div>


        {/* =========================
            STATISTICS
        ========================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "22px",
            marginBottom: "35px",
          }}
        >

          {cards.map((card, index) => (

            <div
              key={index}
              style={{
                background: "#171717",
                border: "1px solid #292929",
                borderRadius: "16px",
                padding: "25px",
                minHeight: "145px",
              }}
            >

              <p
                style={{
                  color: "#a8a8a8",
                  margin: 0,
                  fontSize: "14px",
                }}
              >
                {card.title}
              </p>

              <h2
                style={{
                  color: "#ff2d2d",
                  fontSize: "38px",
                  margin: "15px 0 5px",
                }}
              >
                {loading ? "..." : card.value}
              </h2>

              <p
                style={{
                  color: "#22c55e",
                  margin: 0,
                  fontSize: "12px",
                }}
              >
                ● {card.description}
              </p>

            </div>

          ))}

        </div>


        {/* =========================
            ROLE BASED SECTIONS
        ========================= */}

        {userRole === "system_admin" && (
          <DashboardSection
            title="System Activity"
            description="Recent system activity and audit information"
          />
        )}

        {userRole === "institution_admin" && (
          <DashboardSection
            title="Research Analytics"
            description="Institution research and publication analytics"
          />
        )}

        {userRole === "researcher" && (
          <DashboardSection
            title="Recent Research"
            description="Recent publications and recommended researchers"
          />
        )}

        {userRole === "reviewer" && (
          <DashboardSection
            title="Recent Review Activity"
            description="Latest publication and citation review activity"
          />
        )}

      </div>

    </DashboardLayout>
  );
}


/* =========================
   DASHBOARD SECTION
========================= */

function DashboardSection({
  title,
  description,
}) {

  return (
    <div
      style={{
        background: "#171717",
        border: "1px solid #292929",
        borderRadius: "16px",
        padding: "25px",
        marginBottom: "25px",
      }}
    >

      <h2
        style={{
          color: "white",
          marginTop: 0,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          color: "#999",
        }}
      >
        {description}
      </p>

    </div>
  );
}


export default Dashboard;