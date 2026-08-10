import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { FaEllipsisV, FaUserCircle } from "react-icons/fa";
import useDismissibleLayer from "../../hooks/useDismissibleLayer";

const PAGE_SIZE = 8;
const roles = ["Researcher", "Reviewer", "Student", "Faculty", "Institution Admin"];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [usersOpen, setUsersOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [newAdminId, setNewAdminId] = useState("");
    const [replacementRole, setReplacementRole] = useState("Researcher");
    const [broadcastTitle, setBroadcastTitle] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [history, setHistory] = useState([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const adminLayerRef = useDismissibleLayer(() => setOpenMenuId(null), openMenuId !== null);

    useEffect(() => {
        API.get("/admin/dashboard").then(({ data }) => setStats(data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (!usersOpen) return;
        API.get("/admin/users", { params: { search: search || undefined, role: role || undefined, status: status || undefined, sort_by: sort, sort_order: sortOrder, page, page_size: PAGE_SIZE } })
            .then(({ data }) => {
                setUsers(data.items || []);
                setTotal(data.total || 0);
            })
            .catch(console.error);
    }, [usersOpen, search, role, status, sort, sortOrder, page]);

    useEffect(() => {
        if (!historyOpen) return;
        API.get("/admin/moderation-history", { params: { page_size: 50 } }).then(({ data }) => setHistory(data.items || [])).catch(console.error);
    }, [historyOpen]);

    const refreshUsers = () => setPage((current) => current);

    const updateStatus = async (user, nextStatus) => {
        try {
            await API.put(`/admin/users/${user.id}/status`, null, { params: { status: nextStatus } });
            refreshUsers();
            setUsers((current) => current.map((item) => item.id === user.id ? { ...item, account_status: nextStatus } : item));
        } catch (error) {
            alert(error.response?.data?.detail || "Unable to update user status.");
        }
    };

    const warnUser = async (user) => {
        const reason = window.prompt(`Warning reason for ${user.name}`);
        if (!reason) return;
        try {
            await API.post(`/admin/users/${user.id}/warn`, null, { params: { reason } });
            setUsers((current) => current.map((item) => item.id === user.id ? { ...item, warning_count: (item.warning_count || 0) + 1 } : item));
        } catch (error) {
            alert(error.response?.data?.detail || "Unable to warn user.");
        }
    };

    const changeRole = async (user, nextRole) => {
        try {
            await API.put(`/admin/users/${user.id}/role`, null, { params: { role: nextRole } });
            setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role: nextRole } : item));
        } catch (error) {
            alert(error.response?.data?.detail || "Unable to change role.");
        }
    };

    const removeUser = async (user) => {
        if (!window.confirm(`Remove ${user.name}? This cannot be undone.`)) return;
        try {
            await API.delete(`/admin/users/${user.id}`);
            setUsers((current) => current.filter((item) => item.id !== user.id));
            setTotal((current) => Math.max(0, current - 1));
        } catch (error) {
            alert(error.response?.data?.detail || "Unable to remove user.");
        }
    };

    const transferOwnership = async () => {
        if (!newAdminId) return;
        try {
            await API.post("/admin/transfer-ownership", null, { params: { new_admin_id: Number(newAdminId), replacement_role: replacementRole } });
            alert("System Admin ownership transferred successfully.");
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.detail || "Unable to transfer ownership.");
        }
    };

    const sendBroadcast = async () => {
        if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
        try {
            const response = await API.post("/admin/broadcast", null, { params: { title: broadcastTitle, message: broadcastMessage } });
            alert(`${response.data.recipients} users notified.`);
            setBroadcastTitle("");
            setBroadcastMessage("");
        } catch (error) {
            alert(error.response?.data?.detail || "Unable to send broadcast.");
        }
    };

    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div ref={adminLayerRef} className="page-container">
            <h1>System Admin Dashboard</h1>
            <div className="dashboard-grid">
                <button className="card" type="button" onClick={() => setUsersOpen((open) => !open)}>
                    <h2>{stats.users ?? 0}</h2><p>Users</p><small>{usersOpen ? "Hide users" : "Manage users"}</small>
                </button>
                <div className="card"><h2>{stats.publications ?? 0}</h2><p>Publications</p></div>
                <div className="card"><h2>{stats.institutions ?? 0}</h2><p>Institutions</p></div>
                <div className="card"><h2>{stats.researchers ?? 0}</h2><p>Researchers</p></div>
                <div className="card"><h2>{stats.reviewers ?? 0}</h2><p>Reviewers</p></div>
                <div className="card"><h2>{stats.faculty ?? 0}</h2><p>Faculty</p></div>
            </div>

            {usersOpen && <section className="card-surface" style={{ marginTop: "24px", padding: "22px" }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "18px" }}>
                    <input placeholder="Search name or email" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
                    <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}><option value="">All roles</option>{roles.map((item) => <option key={item}>{item}</option>)}</select>
                    <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option>Active</option><option>Blocked</option><option>Suspended</option></select>
                    <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="name">Sort by name</option><option value="email">Sort by email</option><option value="role">Sort by role</option><option value="status">Sort by status</option></select>
                    <button type="button" onClick={() => setSortOrder((current) => current === "asc" ? "desc" : "asc")}>Order: {sortOrder === "asc" ? "A–Z" : "Z–A"}</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th>Avatar</th><th>Name</th><th>Email</th><th>Role</th><th>Institution</th><th>Verification</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>{users.map((user) => <tr key={user.id}>
                            <td><FaUserCircle aria-hidden="true" size={24} /></td><td>{user.name}</td><td>{user.email}</td>
                            <td><span className="status-badge">{user.role}</span></td>
                            <td>{user.institution || "—"}</td><td>{user.is_verified ? "Verified" : user.verification_status}</td>
                            <td><span className="status-badge">{user.account_status}</span>{user.warning_count ? ` (${user.warning_count} warnings)` : ""}</td>
                            <td className="action-menu-cell">
                                <button type="button" aria-label={`Actions for ${user.name}`} className="icon-button" onClick={() => setOpenMenuId((current) => current === user.id ? null : user.id)}><FaEllipsisV /></button>
                                {openMenuId === user.id && <div className="action-menu">
                                    <button type="button" onClick={() => { setOpenMenuId(null); navigate(`/researcher/${user.id}`); }}>View</button>
                                    <label>Edit Role<select value={user.role} onChange={(event) => { setOpenMenuId(null); changeRole(user, event.target.value); }}>{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
                                    <button type="button" onClick={() => { setOpenMenuId(null); warnUser(user); }}>Warn</button>
                                    <button type="button" onClick={() => { setOpenMenuId(null); updateStatus(user, user.account_status === "Active" ? "Blocked" : "Active"); }}>{user.account_status === "Active" ? "Block" : "Unblock"}</button>
                                    <button type="button" onClick={() => { setOpenMenuId(null); setNewAdminId(String(user.id)); }}>Transfer Admin</button>
                                    <button type="button" className="danger-action" onClick={() => { setOpenMenuId(null); removeUser(user); }}>Remove</button>
                                </div>}
                            </td>
                        </tr>)}</tbody>
                    </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                    <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                    <span>Page {page} of {pageCount}</span>
                    <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</button>
                </div>
            </section>}

            <section className="card-surface" style={{ marginTop: "24px", padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2>Moderation History</h2><button type="button" onClick={() => setHistoryOpen((open) => !open)}>{historyOpen ? "Hide history" : "View history"}</button></div>
                {historyOpen && (history.length ? <div style={{ overflowX: "auto", marginTop: "16px" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th>Target</th><th>Action</th><th>Reason</th><th>Moderator</th><th>Timestamp</th></tr></thead><tbody>{history.map((event) => <tr key={event.id}><td>{event.target}</td><td><span className="status-badge">{event.action}</span></td><td>{event.reason || "—"}</td><td>{event.moderator}</td><td>{new Date(event.timestamp).toLocaleString()}</td></tr>)}</tbody></table></div> : <p style={{ marginTop: "14px" }}>No moderation events recorded.</p>)}
            </section>

            <section className="card-surface" style={{ marginTop: "24px", padding: "22px" }}>
                <h2>Transfer System Admin Ownership</h2>
                <p>Select a verified user. The current System Admin will immediately lose admin privileges.</p>
                <select value={newAdminId} onChange={(event) => setNewAdminId(event.target.value)}><option value="">Select verified user</option>{users.filter((user) => user.role !== "System Admin" && user.is_verified).map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}</select>
                <select value={replacementRole} onChange={(event) => setReplacementRole(event.target.value)} style={{ marginLeft: "10px" }}>{[...roles, "Student"].map((item) => <option key={item}>{item}</option>)}</select>
                <button type="button" onClick={transferOwnership} disabled={!newAdminId} style={{ marginLeft: "10px" }}>Transfer Ownership</button>
            </section>
            <section className="card-surface" style={{ marginTop: "24px", padding: "22px" }}>
                <h2>Admin Broadcast</h2>
                <p>Send an announcement to all active non-admin users.</p>
                <input placeholder="Announcement title" value={broadcastTitle} onChange={(event) => setBroadcastTitle(event.target.value)} style={{ marginTop: "12px", width: "100%" }} />
                <textarea placeholder="Announcement message" value={broadcastMessage} onChange={(event) => setBroadcastMessage(event.target.value)} rows="3" style={{ marginTop: "12px", width: "100%" }} />
                <button type="button" onClick={sendBroadcast} disabled={!broadcastTitle.trim() || !broadcastMessage.trim()} style={{ marginTop: "12px" }}>Send Broadcast</button>
            </section>
        </div>
    );
}
