import { useEffect, useState } from "react";
import API from "../services/api";

function Analytics() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await API.get("/analytics/overview");
      setOverview(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading analytics...</div>;
  }

  if (!overview) {
    return <div style={{ padding: "30px" }}>Analytics data is unavailable.</div>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ color: "var(--text)" }}>📊 Analytics Dashboard</h1>
          <p style={{ color: "var(--muted)", maxWidth: "720px" }}>
            Get a quick view of collaboration activity, publication growth, and institutional leadership in the network.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px", marginTop: "30px" }}>
        <StatCard label="Researchers" value={overview.total_researchers} />
        <StatCard label="Publications" value={overview.total_publications} />
        <StatCard label="Institutions" value={overview.total_institutions} />
        <StatCard label="Conferences" value={overview.total_conferences} />
      </div>


      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px", marginTop: "30px" }}>
        <div style={panelCard}>
          <h2 style={{ color: "var(--text)" }}>Publication Growth</h2>
          {Object.keys(overview.publications_by_year).length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No publication history yet.</p>
          ) : (
            <ol style={{ paddingLeft: "18px", color: "var(--muted)" }}>
              {Object.entries(overview.publications_by_year).map(([year, count]) => (
                <li key={year} style={{ marginBottom: "10px" }}>
                  <strong>{year}</strong>: {count} publications
                </li>
              ))}
            </ol>
          )}
        </div>

        <div style={panelCard}>
          <h2 style={{ color: "var(--text)" }}>Publication Types</h2>
          {Object.entries(overview.publication_types).length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No type distribution available.</p>
          ) : (
            <ul style={{ paddingLeft: "18px", color: "var(--muted)" }}>
              {Object.entries(overview.publication_types).map(([type, count]) => (
                <li key={type} style={{ marginBottom: "10px" }}>
                  <strong>{type}</strong>: {count}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px", marginTop: "30px" }}>
        <PanelCard title="Top Institutions" items={overview.top_institutions} labelKey="institution" valueKey="publications" />
        <PanelCard title="Top Researchers" items={overview.top_researchers} labelKey="researcher" valueKey="publications" />
        <PanelCard title="Top Conferences" items={overview.conference_participation} labelKey="conference" valueKey="publications" />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCard}>
      <div style={{ color: "var(--muted)", fontSize: "14px", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "10px" }}>{label}</div>
      <div style={{ fontSize: "40px", fontWeight: "700", color: "var(--text)" }}>{value}</div>
    </div>
  );
}

function PanelCard({ title, items, labelKey, valueKey }) {
  return (
    <div style={panelCard}>
      <h2 style={{ color: "var(--text)" }}>{title}</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No records found.</p>
      ) : (
        <ul style={{ paddingLeft: "18px", color: "var(--muted)" }}>
          {items.map((item, index) => (
            <li key={index} style={{ marginBottom: "12px" }}>
              <strong>{item[labelKey]}</strong> — {item[valueKey]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const statCard = {
  background: "var(--surface-alt)",
  padding: "28px",
  borderRadius: "18px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)",
  minHeight: "150px",
};

const panelCard = {
  background: "var(--surface-alt)",
  padding: "28px",
  borderRadius: "18px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)",
};

export default Analytics;
