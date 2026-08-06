import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

function Analytics() {
  const [overview, setOverview] = useState(null);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [overviewResponse, networkResponse] = await Promise.all([
        API.get("/analytics/overview"),
        API.get("/analytics/network"),
      ]);
      setOverview(overviewResponse.data);
      setNetwork(networkResponse.data);
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
          <h1 style={{ color: "var(--text)" }}>Analytics Dashboard</h1>
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
            <InteractiveChart id="publication-growth" items={Object.entries(overview.publications_by_year).map(([label, value]) => ({ label, value }))} />
          )}
        </div>

        <div style={panelCard}>
          <h2 style={{ color: "var(--text)" }}>Publication Types</h2>
          {Object.entries(overview.publication_types).length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No type distribution available.</p>
          ) : (
            <InteractiveChart id="publication-types" items={Object.entries(overview.publication_types).map(([label, value]) => ({ label, value }))} />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px", marginTop: "30px" }}>
        <PanelCard title="Top 5 Institutions" items={overview.top_institutions} labelKey="institution" valueKey="publications" onViewMore={() => navigate("/institution")} />
        <PanelCard title="Top 5 Researchers" items={overview.top_researchers} labelKey="researcher" valueKey="publications" onViewMore={() => navigate("/researchers")} />
        <PanelCard title="Top 5 Conferences" items={overview.conference_participation} labelKey="conference" valueKey="publications" onViewMore={() => navigate("/conference")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px", marginTop: "30px" }}>
        <ChartPanel title="Publication Status" id="publication-status" items={Object.entries(overview.publication_status || {}).map(([label, value]) => ({ label, value }))} />
        <DataPanel title="Departments" items={(overview.department_publications || []).map((item) => ({ label: item.department, value: item.publications }))} />
        <DataPanel title="Top Reviewers" items={(overview.top_reviewers || []).map((item) => ({ label: item.reviewer, value: item.reviewed }))} />
        <DataPanel title="Conference Statistics" items={(overview.conference_statistics || []).map((item) => ({ label: item.conference, value: item.publications }))} />
        <ChartPanel title="Citation Trends" id="citation-trends" items={(overview.citation_trends || []).map((item) => ({ label: item.year, value: item.citations }))} />
        <ChartPanel title="Collaboration Growth" id="collaboration-growth" items={(overview.collaboration_growth || []).map((item) => ({ label: item.year, value: item.collaborations }))} />
        <DataPanel title="Research Interests" items={Object.entries(overview.research_interests || {}).map(([label, value]) => ({ label, value }))} />
      </div>

      <div style={{ ...panelCard, marginTop: "30px" }}>
        <h2 style={{ color: "var(--text)" }}>Collaboration Network</h2>
        <p style={{ color: "var(--muted)" }}>{network ? `${network.nodes.length} nodes · ${network.edges.length} relationships` : "Network data unavailable."}</p>
        {network && <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>{Object.entries(network.nodes.reduce((counts, node) => ({ ...counts, [node.type]: (counts[node.type] || 0) + 1 }), {})).map(([type, count]) => <span className="status-badge" key={type}>{type}: {count}</span>)}</div>}
      </div>

      <div style={{ ...panelCard, marginTop: "30px" }}>
        <h2 style={{ color: "var(--text)" }}>Latest Publications</h2>
        {(overview.latest_publications || []).map((publication) => <div key={publication.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--border)" }}><strong>{publication.title}</strong><span className="status-badge">{publication.year || "—"} · {publication.status}</span></div>)}
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

function PanelCard({ title, items, labelKey, valueKey, onViewMore }) {
  return (
    <div style={panelCard}>
      <div className="panel-heading"><h2 style={{ color: "var(--text)" }}>{title}</h2>{onViewMore && <button type="button" className="inline-action" onClick={onViewMore}>View more <FaArrowRight aria-hidden="true" /></button>}</div>
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

function DataPanel({ title, items }) {
  return <div style={panelCard}><h2 style={{ color: "var(--text)" }}>{title}</h2><BarList items={items} /></div>;
}

function ChartPanel({ title, id, items }) {
  return <div style={panelCard}><h2 style={{ color: "var(--text)" }}>{title}</h2><InteractiveChart id={id} items={items} /></div>;
}

function InteractiveChart({ id, items = [] }) {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);
  const width = 640;
  const height = 220;
  const chartHeight = 160;
  const barWidth = items.length ? Math.max(18, (width - 40) / items.length - 10) : 20;

  const exportChart = () => {
    const svg = document.getElementById(id);
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;
      const context = canvas.getContext("2d");
      context.scale(2, 2);
      context.fillStyle = "#0f172a";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0);
      const link = document.createElement("a");
      link.download = `${id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  if (!items.length) return <p style={{ color: "var(--muted)" }}>No records found.</p>;
  return <div style={{ marginTop: "14px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
      <span className="status-badge"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} /> Live data</span>
      <button type="button" onClick={exportChart} style={{ padding: "7px 10px", fontSize: "12px" }}>Export PNG</button>
    </div>
    <div style={{ position: "relative", overflowX: "auto" }}>
      <svg id={id} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${id} chart`} style={{ width: "100%", minWidth: "420px", height: "220px" }}>
        <line x1="20" y1={chartHeight} x2={width - 20} y2={chartHeight} stroke="rgba(148,163,184,.35)" />
        {items.map((item, index) => {
          const value = Number(item.value) || 0;
          const barHeight = value / max * chartHeight;
          const x = 25 + index * ((width - 50) / items.length);
          const y = chartHeight - barHeight;
          return <g key={`${item.label}-${index}`} onMouseEnter={() => setHovered(item)} onMouseLeave={() => setHovered(null)}>
            <rect x={x} y={y} width={Math.min(barWidth, (width - 50) / items.length - 8)} height={Math.max(2, barHeight)} rx="5" fill="var(--accent)" opacity={hovered && hovered !== item ? 0.45 : 0.9} />
            <text x={x + barWidth / 2} y={chartHeight + 20} textAnchor="middle" fill="var(--muted)" fontSize="11">{String(item.label).slice(0, 12)}</text>
          </g>;
        })}
      </svg>
      {hovered && <div style={{ position: "absolute", top: 8, right: 12, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow)", color: "var(--text)", pointerEvents: "none" }}><strong>{hovered.label}</strong><br />{hovered.value}</div>}
    </div>
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "4px", color: "var(--muted)", fontSize: "12px" }}><span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: "var(--accent)", marginRight: 5 }} />Publications / events</span></div>
  </div>;
}

function BarList({ items = [] }) {
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);
  if (!items.length) return <p style={{ color: "var(--muted)" }}>No records found.</p>;
  return <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>{items.map((item) => <div key={`${item.label}-${item.value}`}><div style={{ display: "flex", justifyContent: "space-between", gap: "10px", color: "var(--muted)" }}><span>{item.label}</span><strong>{item.value}</strong></div><div style={{ height: "8px", borderRadius: "999px", background: "var(--border)", marginTop: "5px" }}><div style={{ width: `${Math.max(4, (Number(item.value) || 0) / max * 100)}%`, height: "100%", borderRadius: "999px", background: "var(--accent)" }} /></div></div>)}</div>;
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
