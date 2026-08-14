import React, { useEffect, useState } from "react";
import {
  getAuditLogs,
  getAuditLogsByModule,
} from "../services/auditService";

const Audit = () => {
  const [logs, setLogs] = useState([]);
  const [selectedModule, setSelectedModule] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");

      let data;

      if (selectedModule === "All") {
        data = await getAuditLogs();
      } else {
        data = await getAuditLogsByModule(selectedModule);
      }

      setLogs(data);
    } catch (err) {
      console.error("Error loading audit logs:", err);
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedModule]);

  return (
    <div style={{ padding: "24px" }}>
      <h1>Audit & Compliance</h1>

      <p>
        Track user activity, publication history, project logs and security
        events.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>Filter by Module: </strong>
        </label>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          style={{
            marginLeft: "10px",
            padding: "8px",
            borderRadius: "5px",
          }}
        >
          <option value="All">All</option>
          <option value="User">User Activity</option>
          <option value="Publication">Publication History</option>
          <option value="Project">Project Logs</option>
          <option value="Security">Security Logs</option>
        </select>
      </div>

      {loading && <p>Loading audit logs...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && logs.length === 0 && (
        <p>No audit logs found.</p>
      )}

      {!loading && !error && logs.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>User ID</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Module</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Entity</th>
                <th style={thStyle}>IP Address</th>
                <th style={thStyle}>Date & Time</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={tdStyle}>{log.id}</td>
                  <td style={tdStyle}>{log.user_id ?? "-"}</td>
                  <td style={tdStyle}>{log.action}</td>
                  <td style={tdStyle}>{log.module}</td>
                  <td style={tdStyle}>{log.description || "-"}</td>
                  <td style={tdStyle}>
                    {log.entity_type
                      ? `${log.entity_type} #${log.entity_id ?? "-"}`
                      : "-"}
                  </td>
                  <td style={tdStyle}>{log.ip_address || "-"}</td>
                  <td style={tdStyle}>
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: "12px",
  borderBottom: "1px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

export default Audit;