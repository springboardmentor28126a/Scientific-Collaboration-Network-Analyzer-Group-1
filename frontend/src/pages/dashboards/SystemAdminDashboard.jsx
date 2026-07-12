import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { fetchInstitutions } from "../../services/institutionService";
import { createInstitutionAdmin } from "../../services/userService";
import "../../styles/admin-forms.css";

function SystemAdminDashboard() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    institution_id: "",
  });

  useEffect(() => {
    fetchInstitutions()
      .then(setInstitutions)
      .catch(() => toast.error("Could not load institutions."));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    setForm((prev) => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.institution_id) {
      toast.error("Select an institution.");
      return;
    }

    setLoading(true);
    try {
      const created = await createInstitutionAdmin({
        username: form.username,
        email: form.email,
        password: form.password,
        institution_id: Number(form.institution_id),
      });

      toast.success(`Institution admin "${created.username}" created. Share the temporary password with them securely.`);

      setForm({ username: "", email: "", password: "", institution_id: "" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not create institution admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell
        title="System Admin Dashboard"
        subtitle="Manage institutions and onboard institution admins."
        >
        <div className="stat-row">
            <div className="stat-card">
            <div className="stat-value">{institutions.length}</div>
            <div className="stat-label">Institutions</div>
            </div>
        </div>
      <section className="admin-form-section">
        <div className="admin-form-header">
          <h2>Create an institution admin</h2>
          <p className="admin-form-sub">
            They'll log in with the temporary password below and be asked to set a new one.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div>
              <label>Username</label>
              <input name="username" value={form.username} onChange={handleChange} required />
            </div>
            <div>
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <label>Institution</label>
          <select name="institution_id" value={form.institution_id} onChange={handleChange} required>
            <option value="">Select institution</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>{i.institution_name}</option>
            ))}
          </select>

          <label>Temporary password</label>
          <div className="admin-password-row">
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="8+ chars, upper, lower, number, symbol"
            />
            <button type="button" className="btn-ghost-outline" onClick={generatePassword}>
              Generate
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create institution admin"}
          </button>
        </form>
      </section>

      <section className="admin-links-section">
        <h2>Manage</h2>
        <div className="admin-links-grid">
          <a href="/institutions" className="admin-link-card">
            <span>Institutions</span>
            <p>Add, edit, or remove institutions on the platform.</p>
          </a>
        </div>
      </section>
    </DashboardShell>
  );
}

export default SystemAdminDashboard;