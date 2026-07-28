import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";
import { fetchAllUsers } from "../services/userService";

const STATUS_BADGE = {
  APPROVED: "pub-badge pub-badge-published",
  REJECTED: "pub-badge pub-badge-rejected",
  SUSPENDED: "pub-badge pub-badge-draft",
};

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error("Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Users</h4>
            <span className="badge bg-primary fs-6">{users.length} Users</span>
          </div>

          <p className="text-muted mb-4">
            Approved, rejected, and suspended accounts across the platform.
            Researchers still awaiting institution approval are not shown here.
          </p>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.username}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.role.replaceAll("_", " ")}</td>
                      <td>
                        <span className={STATUS_BADGE[u.status] || "pub-badge pub-badge-draft"}>
                          {u.status}
                        </span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserManagementPage;