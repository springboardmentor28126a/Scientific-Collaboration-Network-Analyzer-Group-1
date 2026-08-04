import { useEffect, useState } from "react";
import API from "../../services/api";

export default function AdminDashboard() {

    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [newAdminId, setNewAdminId] = useState("");
    const [replacementRole, setReplacementRole] = useState("Researcher");

    useEffect(() => {

        loadDashboard();
        loadUsers();

    }, []);

    const loadDashboard = async () => {

        const res = await API.get(
            "/admin/dashboard"
        );

        setStats(res.data);

    };

    const loadUsers = async () => {
        try {
            const response = await API.get("/admin/users");
            setUsers(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const transferOwnership = async () => {
        if (!newAdminId) return;
        try {
            await API.post("/admin/transfer-ownership", null, {
                params: {
                    new_admin_id: Number(newAdminId),
                    replacement_role: replacementRole,
                },
            });
            alert("System Admin ownership transferred successfully.");
            await loadUsers();
        } catch (error) {
            alert(error.response?.data?.detail || "Unable to transfer ownership.");
        }
    };

    return (

        <div>

            <h1>⚙ System Admin Dashboard</h1>

            <div className="dashboard-grid">

                <div className="card">

                    <h2>{stats.users}</h2>

                    <p>Users</p>

                </div>

                <div className="card">

                    <h2>{stats.publications}</h2>

                    <p>Publications</p>

                </div>

                <div className="card">

                    <h2>{stats.institutions}</h2>

                    <p>Institutions</p>

                </div>

                <div className="card">

                    <h2>{stats.researchers}</h2>

                    <p>Researchers</p>

                </div>

                <div className="card">

                    <h2>{stats.reviewers}</h2>

                    <p>Reviewers</p>

                </div>

                <div className="card">

                    <h2>{stats.faculty}</h2>

                    <p>Faculty</p>

                </div>

            </div>

            <div className="card" style={{ marginTop: "24px" }}>
                <h2>Transfer System Admin Ownership</h2>
                <p>Select a verified user. The current System Admin will immediately lose admin privileges.</p>
                <select value={newAdminId} onChange={(event) => setNewAdminId(event.target.value)}>
                    <option value="">Select verified user</option>
                    {users
                        .filter((user) => user.role !== "System Admin" && user.is_verified)
                        .map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                </select>
                <select
                    value={replacementRole}
                    onChange={(event) => setReplacementRole(event.target.value)}
                    style={{ marginLeft: "10px" }}
                >
                    <option value="Researcher">Researcher</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Institution Admin">Institution Admin</option>
                </select>
                <button onClick={transferOwnership} disabled={!newAdminId} style={{ marginLeft: "10px" }}>
                    Transfer Ownership
                </button>
            </div>

        </div>

    );

}
