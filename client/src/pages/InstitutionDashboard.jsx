import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function InstitutionDashboard() {
  const [dashboardQuery, setDashboardQuery] = useState("");
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardResults, setDashboardResults] = useState([]);

  const navigate = useNavigate();

  const loadDashboardResults = async (q) => {
    const query = (q ?? "").trim();

    if (!query) {
      setDashboardResults([]);
      return;
    }

    try {
      setDashboardLoading(true);

      const response = await API.get(
        `/institution/search/details?query=${encodeURIComponent(query)}`
      );

      setDashboardResults(response.data?.results ?? []);
    } catch (error) {
      console.log(error);
      setDashboardResults([]);
    } finally {
      setDashboardLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>🏫 Institute Collaboration Dashboard</h1>

      <p
        style={{
          opacity: 0.9,
          marginTop: 10,
          marginBottom: 20,
        }}
      >
        Search by institute name. View institution analytics including total
        users, role-wise distribution, publications and conferences.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "25px",
        }}
      >
        <input
          type="text"
          placeholder="Search institute..."
          value={dashboardQuery}
          onChange={(e) => setDashboardQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              loadDashboardResults(dashboardQuery);
            }
          }}
          style={{
            width: "400px",
            padding: "12px",
            borderRadius: "10px",
          }}
        />

        <button
          onClick={() => loadDashboardResults(dashboardQuery)}
          style={{
            padding: "12px 18px",
            border: "none",
            borderRadius: "10px",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          🔎 Search
        </button>
      </div>

      {dashboardLoading && <h3>Loading...</h3>}

      {!dashboardLoading &&
        dashboardResults.map((item) => {
          const inst = item.institution;
          const stats = item.statistics;
          const users = item.users ?? [];
          const publications = item.publications ?? [];

          return (
            <div
              key={inst.id}
              style={{
                marginBottom: 30,
                padding: 20,
                borderRadius: 15,
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <h2>{inst.name}</h2>

              <p>
                📍 {inst.city}, {inst.state}, {inst.country}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 10,
                  marginTop: 20,
                  marginBottom: 25,
                }}
              >
                <StatCard
                  title="👥 Total Users"
                  value={stats.total_users}
                />

                <StatCard
                  title="👨‍🔬 Researchers"
                  value={stats.researchers}
                />

                <StatCard
                  title="📝 Reviewers"
                  value={stats.reviewers}
                />

                <StatCard
                  title="🏢 Institution Admins"
                  value={stats.institution_admins}
                />

                <StatCard
                  title="⚙️ System Admins"
                  value={stats.system_admins}
                />

                <StatCard
                  title="📄 Publications"
                  value={stats.publications}
                />

                <StatCard
                  title="🎤 Conferences"
                  value={stats.conferences}
                />
              </div>

              <h3>👥 Institution Members</h3>

              {users.length === 0 ? (
                <p>No users found.</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 8,
                    }}
                  >
                    <strong>{user.name}</strong>

                    <div style={{ opacity: 0.8 }}>
                      {user.role} • {user.email}
                    </div>
                  </div>
                ))
              )}

              <h3 style={{ marginTop: 25 }}>
                📄 Publications
              </h3>

              {publications.length === 0 ? (
                <p>No publications found.</p>
              ) : (
                publications.slice(0, 5).map((pub) => (
                  <div
                    key={pub.id}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 8,
                    }}
                  >
                    <strong>{pub.title}</strong>

                    <div>{pub.journal}</div>
                  </div>
                ))
              )}

              <button
                onClick={() =>
                  navigate(`/institution/${inst.id}`)
                }
                style={{
                  marginTop: 20,
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                👁 View Full Institute
              </button>
            </div>
          );
        })}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        padding: 15,
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 14,
          opacity: 0.8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 8,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default InstitutionDashboard;