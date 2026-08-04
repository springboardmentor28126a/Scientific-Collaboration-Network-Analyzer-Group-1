import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import "../styles/auth.css";

const ROLES = [
  { value: "Researcher", label: "Researcher", desc: "Submit publications and track projects" },
  { value: "InstitutionAdmin", label: "Institution Admin", desc: "Manage institutional data and departments" },
  { value: "Reviewer", label: "Reviewer", desc: "Review and evaluate submitted work" },
  { value: "SystemAdmin", label: "System Admin", desc: "Full platform access and audit controls" },
];

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", role: "Researcher" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(" "));
      } else if (!err.response) {
        setError("Registration failed because the backend is not reachable. Start or restart the backend server.");
      } else {
        setError("Registration failed. Please check your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-layout">
        {/* Brand Panel */}
        <aside className="auth-panel auth-panel--brand">
          <div className="auth-network-visual">
            <div className="auth-node">👩‍🔬</div>
            <div className="auth-node">🏛</div>
            <div className="auth-node">🔗</div>
          </div>
          <p className="dashboard-badge">Join the network</p>
          <h1 className="auth-panel-title">Build your research profile in minutes.</h1>
          <p className="auth-panel-copy">
            Create your account to start collaborating across institutions, publishing research, and tracking cross-disciplinary projects.
          </p>
          <div className="auth-highlights">
            <div className="auth-highlight">
              <span className="auth-highlight-label">⚡ Fast Setup</span>
              <span className="auth-highlight-value">Create your profile in under 2 minutes</span>
            </div>
            <div className="auth-highlight">
              <span className="auth-highlight-label">🔐 Role-Based Access</span>
              <span className="auth-highlight-value">Permissions tailored to your responsibility</span>
            </div>
          </div>
        </aside>

        {/* Register Form */}
        <section className="auth-shell">
          <div className="auth-copy-block">
            <p className="auth-kicker">Get started</p>
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">Set up access and start collaborating across institutions.</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field">
              <span>Email address</span>
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="researcher@institution.edu"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="auth-input"
              />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="Create a secure password (min 6 chars)"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
                className="auth-input"
              />
            </label>
            <label className="auth-field">
              <span>Account role</span>
              <select
                id="register-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="auth-input"
              >
                {ROLES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            {form.role && (
              <div className="auth-role-desc">
                {ROLES.find(r => r.value === form.role)?.desc}
              </div>
            )}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <div className="auth-actions">
              <button id="register-submit" type="submit" disabled={loading} className="auth-button">
                {loading ? "Creating account..." : "Create account →"}
              </button>
              <p className="auth-footer">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
