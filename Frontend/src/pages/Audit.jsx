import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { getAuditLogs } from "../api/audit";
import "./Audit.css";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getAuditLogs()
      .then((res) => {
        if (!ignore) {
          setLogs(res.data);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.detail || "Access Denied: You do not have permissions to view audit trails.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const getActionBadgeClass = (action) => {
    if (action.includes("CREATE")) return "audit-action-badge--create";
    if (action.includes("UPDATE") || action.includes("ASSIGN")) return "audit-action-badge--update";
    if (action.includes("DELETE") || action.includes("REMOVE")) return "audit-action-badge--delete";
    return "audit-action-badge--default";
  };

  const formatTimestamp = (isoStr) => {
    return new Date(isoStr).toLocaleString();
  };

  return (
    <AppShell>
      <main className="audit-page">
        <header className="audit-header">
          <div>
            <p className="dashboard-badge" style={{ background: "#fde8e8", color: "#9b1c1c" }}>Admin & Compliance</p>
            <h1 className="audit-title">System Audit Log</h1>
            <p className="audit-subtitle">
              Verify platform operations, track user activity trails, and audit data compliance indicators across all systems.
            </p>
          </div>
        </header>

        {loading ? (
          <p className="pub-loading">Loading audit trails...</p>
        ) : error ? (
          <div className="audit-log-panel" style={{ borderColor: "#fecaca", textAlign: "center", padding: "40px" }}>
            <p className="pub-error" style={{ fontSize: "1.1rem" }}>{error}</p>
          </div>
        ) : (
          <section className="audit-log-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2>Security Audit Trail</h2>
              <span className="dashboard-badge">System Logs</span>
            </div>

            {logs.length === 0 ? (
              <p className="pub-empty">No activity logs recorded yet.</p>
            ) : (
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action Code</th>
                    <th>Source Table</th>
                    <th>Record ID</th>
                    <th>Operation Details</th>
                    <th>User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{formatTimestamp(log.created_at)}</td>
                      <td>
                        <span className={`audit-action-badge ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td><code>{log.table_name || "N/A"}</code></td>
                      <td>{log.record_id || "N/A"}</td>
                      <td style={{ color: "var(--text-h)", fontWeight: "500" }}>{log.details || "No details"}</td>
                      <td><code>{log.user_id ? `User #${log.user_id}` : "System"}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </AppShell>
  );
}
