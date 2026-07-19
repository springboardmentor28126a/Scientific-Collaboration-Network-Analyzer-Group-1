import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { createReviewer } from "../../services/userService";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { getPendingResearchers, approveResearcher, rejectResearcher } from "../../services/userService";
import "../../styles/approvals.css";

function InstitutionAdminDashboard() {
  const { auth } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOnId, setActingOnId] = useState(null);
  const [reviewerForm, setReviewerForm] = useState({ username: "", email: "", password: "" });
  const [reviewerCredentials, setReviewerCredentials] = useState(null);
  const [reviewerLoading, setReviewerLoading] = useState(false);
  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await getPendingResearchers();
      setPending(data);
    } catch (err) {
      toast.error("Could not load pending researchers.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setActingOnId(userId);
    try {
      await approveResearcher(userId);
      toast.success("Researcher approved.");
      setPending((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not approve researcher.");
    } finally {
      setActingOnId(null);
    }
  };
  const handleReviewerChange = (e) => {
    setReviewerForm({ ...reviewerForm, [e.target.name]: e.target.value });
  };
  const generateReviewerPassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let pass = "";
  for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  setReviewerForm((prev) => ({ ...prev, password: pass }));
};

const handleReviewerSubmit = async (e) => {
  e.preventDefault();
  setReviewerLoading(true);
  try {
    const created = await createReviewer({
      username: reviewerForm.username,
      email: reviewerForm.email,
      password: reviewerForm.password,
      institution_id: auth.institution_id,
    });
    setReviewerCredentials({
      username: created.username,
      password: reviewerForm.password,
      email: created.email,
    });
    setReviewerForm({ username: "", email: "", password: "" });
  } catch (err) {
    toast.error(err?.response?.data?.detail || "Could not create reviewer.");
  } finally {
    setReviewerLoading(false);
  }
};
  const handleReject = async (userId) => {
    const confirmed = window.confirm("Reject this researcher's application?");
    if (!confirmed) return;

    setActingOnId(userId);
    try {
      await rejectResearcher(userId);
      toast.success("Researcher rejected.");
      setPending((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not reject researcher.");
    } finally {
      setActingOnId(null);
    }
  };

  return (
    <DashboardShell
        title="Institution Admin Dashboard"
        subtitle="Review and manage researchers at your institution."
        >
        <div className="stat-row">
            <div className="stat-card">
            <div className="stat-value">{pending.length}</div>
            <div className="stat-label">Pending approvals</div>
            </div>
        </div>
      <section className="approvals-section">
        <div className="approvals-header">
          <h2>Pending researcher approvals</h2>
          <span className="approvals-count">{pending.length} pending</span>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && pending.length === 0 && (
          <div className="approvals-empty">
            <p>No pending researchers right now. New registrations from your institution will show up here.</p>
          </div>
        )}

        {!loading && pending.length > 0 && (
          <div className="approvals-table-wrap">
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Requested</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((u) => (
                  <tr key={u.id}>
                    <td>{u.first_name} {u.last_name}</td>
                    <td className="mono">{u.username}</td>
                    <td>{u.email}</td>
                    <td className="mono">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="approvals-actions">
                      <button
                        className="btn-approve"
                        disabled={actingOnId === u.id}
                        onClick={() => handleApprove(u.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        disabled={actingOnId === u.id}
                        onClick={() => handleReject(u.id)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="admin-form-section">
  <div className="admin-form-header">
    <h2>Create a reviewer</h2>
    <p className="admin-form-sub">For your institution. They'll set their own password on first login.</p>
  </div>

  <form onSubmit={handleReviewerSubmit} className="admin-form">
    <div className="admin-form-grid">
      <div>
        <label>Username</label>
        <input name="username" value={reviewerForm.username} onChange={handleReviewerChange} required />
      </div>
      <div>
        <label>Email</label>
        <input type="email" name="email" value={reviewerForm.email} onChange={handleReviewerChange} required />
      </div>
    </div>

    <label>Temporary password</label>
    <div className="admin-password-row">
      <input name="password" value={reviewerForm.password} onChange={handleReviewerChange} required />
      <button type="button" className="btn-ghost-outline" onClick={generateReviewerPassword}>Generate</button>
    </div>

    <button type="submit" className="btn-primary" disabled={reviewerLoading}>
      {reviewerLoading ? "Creating..." : "Create reviewer"}
    </button>
  </form>

  {reviewerCredentials && (
    <div className="credentials-box" style={{ marginTop: "1rem" }}>
      <div><span>Username</span><code>{reviewerCredentials.username}</code></div>
      <div><span>Email</span><code>{reviewerCredentials.email}</code></div>
      <div><span>Temporary password</span><code>{reviewerCredentials.password}</code></div>
    </div>
  )}
</section>
    </DashboardShell>
  );
}

export default InstitutionAdminDashboard;