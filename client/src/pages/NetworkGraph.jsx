import { useEffect, useState } from "react";
import API from "../services/api";

function NetworkGraph() {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNetwork();
  }, []);

  const loadNetwork = async () => {
    try {
      const response = await API.get("/analytics/network");
      setNetwork(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading network graph...</div>;
  }

  if (!network) {
    return <div style={{ padding: "30px" }}>Network data is unavailable.</div>;
  }

  const institutionNodes = network.nodes.filter((node) => node.type === "institution");
  const researcherNodes = network.nodes.filter((node) => node.type === "researcher");
  const publicationNodes = network.nodes.filter((node) => node.type === "publication");
  const conferenceNodes = network.nodes.filter((node) => node.type === "conference");

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1>🌐 Collaboration Network</h1>
          <p style={{ color: "var(--muted)", maxWidth: "720px" }}>
            Explore the research network structure with institutions, researchers, publications, and conferences.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px", marginTop: "30px" }}>
        <SummaryCard title="Institutions" count={institutionNodes.length} color="#2563eb" />
        <SummaryCard title="Researchers" count={researcherNodes.length} color="#0f766e" />
        <SummaryCard title="Publications" count={publicationNodes.length} color="#9333ea" />
        <SummaryCard title="Conferences" count={conferenceNodes.length} color="#dc2626" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "30px" }}>
        <div style={panelCard}>
          <h2 style={{ color: "var(--text)" }}>Network Edge Summary</h2>
          <p style={{ color: "var(--muted)" }}>A quick overview of relation types connecting the research ecosystem.</p>
          <ul style={{ paddingLeft: "18px", color: "var(--muted)" }}>
            {groupEdges(network.edges).map((edge) => (
              <li key={edge.type} style={{ marginBottom: "12px" }}>
                <strong>{edge.type}</strong>: {edge.count} edges
              </li>
            ))}
          </ul>
        </div>

        <div style={panelCard}>
          <h2 style={{ color: "var(--text)" }}>Top Node Types</h2>
          <ul style={{ paddingLeft: "18px", color: "var(--muted)" }}>
            <li style={{ marginBottom: "10px" }}><strong>Institutions</strong> connect to researchers and publications.</li>
            <li style={{ marginBottom: "10px" }}><strong>Researchers</strong> author publications and connect to institutions.</li>
            <li style={{ marginBottom: "10px" }}><strong>Publications</strong> show authorship, institution, and conference links.</li>
            <li style={{ marginBottom: "10px" }}><strong>Conferences</strong> display publication presentations and collaborations.</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <div style={panelCard}>
          <h2 style={{ color: "var(--text)" }}>Recent Network Edges</h2>
          {network.edges.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No edges available.</p>
          ) : (
            <div style={{ maxHeight: "420px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Source</th>
                    <th style={tableHeader}>Target</th>
                    <th style={tableHeader}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {network.edges.slice(0, 40).map((edge, index) => (
                    <tr
                      key={`${edge.source}-${edge.target}-${index}`}
                      style={index % 2 === 0 ? { background: "var(--surface)" } : {}}
                    >
                      <td style={tableCell}>{edge.source}</td>
                      <td style={tableCell}>{edge.target}</td>
                      <td style={tableCell}>{edge.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, count, color }) {
  return (
    <div style={{ ...summaryCard, borderTop: `4px solid ${color}` }}>
      <div style={{ color: "var(--muted)", fontSize: "14px", textTransform: "uppercase", marginBottom: "10px" }}>{title}</div>
      <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--text)" }}>{count}</div>
    </div>
  );
}

function groupEdges(edges) {
  const counts = {};
  edges.forEach((edge) => {
    counts[edge.type] = (counts[edge.type] || 0) + 1;
  });
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
}

const summaryCard = {
  background: "var(--surface-alt)",
  padding: "24px",
  borderRadius: "18px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)",
};

const panelCard = {
  background: "var(--surface-alt)",
  padding: "28px",
  borderRadius: "18px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)",
};

const tableHeader = {
  textAlign: "left",
  padding: "14px 12px",
  borderBottom: "1px solid var(--border)",
  color: "var(--text)",
};

const tableCell = {
  padding: "14px 12px",
  color: "var(--muted)",
  fontSize: "14px",
};

export default NetworkGraph;
