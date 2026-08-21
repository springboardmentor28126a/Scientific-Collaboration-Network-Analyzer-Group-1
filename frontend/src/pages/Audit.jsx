import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { getAuditLogs } from "../api/audit";
import "./Audit.css";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  useEffect(() => {
    let ignore = false;

    getAuditLogs()
      .then((res) => {
        if (!ignore) {
          setLogs(Array.isArray(res.data) ? res.data : []);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err.response?.data?.detail ||
              "Access Denied: You do not have permissions to view audit trails."
          );
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

  const getActionType = (action = "") => {
    const value = action.toUpperCase();

    if (value.includes("CREATE")) return "CREATE";
    if (value.includes("UPDATE") || value.includes("ASSIGN")) return "UPDATE";
    if (value.includes("DELETE") || value.includes("REMOVE")) return "DELETE";

    return "OTHER";
  };

  const getActionBadgeClass = (action) => {
    const type = getActionType(action);

    if (type === "CREATE") return "audit-badge audit-badge--create";
    if (type === "UPDATE") return "audit-badge audit-badge--update";
    if (type === "DELETE") return "audit-badge audit-badge--delete";

    return "audit-badge audit-badge--other";
  };

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return "—";

    const date = new Date(isoStr);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const statistics = useMemo(() => {
    return {
      total: logs.length,
      creates: logs.filter((log) => getActionType(log.action) === "CREATE").length,
      updates: logs.filter((log) => getActionType(log.action) === "UPDATE").length,
      deletes: logs.filter((log) => getActionType(log.action) === "DELETE").length,
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesAction =
        actionFilter === "ALL" ||
        getActionType(log.action) === actionFilter;

      if (!matchesAction) return false;

      if (!query) return true;

      return [
        log.action,
        log.table_name,
        log.details,
        log.user_id,
        log.record_id,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [logs, search, actionFilter]);

  return (
    <AppShell>
      <main className="audit-page">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}
        <header className="audit-hero">

          <div className="audit-hero-content">

            <div className="audit-eyebrow-row">
              <span className="audit-eyebrow">
                Security & Compliance
              </span>

              <span className="audit-status">
                <span className="audit-status-dot"></span>
                Monitoring Active
              </span>
            </div>

            <h1 className="audit-title">
              System Audit Log
            </h1>

            <p className="audit-subtitle">
              Monitor platform activity, review operational changes,
              and maintain a transparent record of system events
              across the research collaboration network.
            </p>

          </div>

          <div className="audit-hero-meta">
            <span className="audit-meta-label">
              AUDIT CENTER
            </span>

            <strong>
              Activity Monitoring
            </strong>

            <span>
              {logs.length} recorded events
            </span>
          </div>

        </header>


        {/* =====================================================
            STATISTICS
        ===================================================== */}
        <section className="audit-stats">

          <div className="audit-stat-card">
            <div className="audit-stat-icon">
              ◉
            </div>

            <div>
              <span className="audit-stat-label">
                Total Events
              </span>

              <strong className="audit-stat-value">
                {statistics.total}
              </strong>

              <span className="audit-stat-description">
                Recorded system activity
              </span>
            </div>
          </div>


          <div className="audit-stat-card">
            <div className="audit-stat-icon audit-stat-icon--create">
              +
            </div>

            <div>
              <span className="audit-stat-label">
                Creations
              </span>

              <strong className="audit-stat-value">
                {statistics.creates}
              </strong>

              <span className="audit-stat-description">
                New records created
              </span>
            </div>
          </div>


          <div className="audit-stat-card">
            <div className="audit-stat-icon audit-stat-icon--update">
              ↻
            </div>

            <div>
              <span className="audit-stat-label">
                Updates
              </span>

              <strong className="audit-stat-value">
                {statistics.updates}
              </strong>

              <span className="audit-stat-description">
                Records modified
              </span>
            </div>
          </div>


          <div className="audit-stat-card">
            <div className="audit-stat-icon audit-stat-icon--delete">
              ×
            </div>

            <div>
              <span className="audit-stat-label">
                Deletions
              </span>

              <strong className="audit-stat-value">
                {statistics.deletes}
              </strong>

              <span className="audit-stat-description">
                Records removed
              </span>
            </div>
          </div>

        </section>


        {/* =====================================================
            MAIN AUDIT WORKSPACE
        ===================================================== */}
        <section className="audit-workspace">

          <div className="audit-workspace-header">

            <div>
              <span className="audit-section-kicker">
                ACTIVITY MONITOR
              </span>

              <h2>
                Security Audit Trail
              </h2>

              <p>
                Review recent operations performed across the platform.
              </p>
            </div>

            <div className="audit-record-count">
              <strong>
                {filteredLogs.length}
              </strong>

              <span>
                visible records
              </span>
            </div>

          </div>


          {/* =====================================================
              FILTER BAR
          ===================================================== */}
          <div className="audit-toolbar">

            <div className="audit-search-wrapper">

              <span className="audit-search-icon">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actions, tables, users or details..."
                className="audit-search"
              />

            </div>


            <div className="audit-filter-wrapper">

              <label htmlFor="audit-action-filter">
                Action
              </label>

              <select
                id="audit-action-filter"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="audit-filter"
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="OTHER">Other</option>
              </select>

            </div>

          </div>


          {/* =====================================================
              CONTENT
          ===================================================== */}
          {loading ? (

            <div className="audit-state">
              <div className="audit-loader"></div>

              <h3>
                Loading audit activity
              </h3>

              <p>
                Retrieving system activity records...
              </p>
            </div>

          ) : error ? (

            <div className="audit-state audit-state--error">

              <div className="audit-state-icon">
                !
              </div>

              <h3>
                Audit access unavailable
              </h3>

              <p>
                {error}
              </p>

            </div>

          ) : filteredLogs.length === 0 ? (

            <div className="audit-state">

              <div className="audit-state-icon">
                —
              </div>

              <h3>
                No audit events found
              </h3>

              <p>
                {search || actionFilter !== "ALL"
                  ? "Try changing your search or filter."
                  : "No system activity has been recorded yet."}
              </p>

            </div>

          ) : (

            <div className="audit-table-wrapper">

              <table className="audit-table">

                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Source</th>
                    <th>Record</th>
                    <th>Operation Details</th>
                    <th>Performed By</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredLogs.map((log) => (

                    <tr key={log.id}>

                      <td>
                        <div className="audit-time">
                          <strong>
                            {formatTimestamp(log.created_at)}
                          </strong>

                          <span>
                            Event #{log.id}
                          </span>
                        </div>
                      </td>


                      <td>
                        <span className={getActionBadgeClass(log.action)}>
                          <span className="audit-badge-dot"></span>
                          {log.action || "UNKNOWN"}
                        </span>
                      </td>


                      <td>
                        <span className="audit-source">
                          {log.table_name || "System"}
                        </span>
                      </td>


                      <td>
                        <span className="audit-record-id">
                          {log.record_id
                            ? `#${log.record_id}`
                            : "—"}
                        </span>
                      </td>


                      <td>
                        <div className="audit-details">
                          {log.details || "No additional details provided."}
                        </div>
                      </td>


                      <td>
                        <span className="audit-user">
                          {log.user_id
                            ? `User #${log.user_id}`
                            : "System"}
                        </span>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* =====================================================
            FOOTER INFORMATION
        ===================================================== */}
        <div className="audit-footer">

          <div>
            <span className="audit-footer-indicator"></span>

            <span>
              Audit monitoring is active
            </span>
          </div>

          <span>
            Showing {filteredLogs.length} of {logs.length} events
          </span>

        </div>

      </main>
    </AppShell>
  );
}