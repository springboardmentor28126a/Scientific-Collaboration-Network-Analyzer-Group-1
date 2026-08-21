import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import "../styles/auth.css";

const ROLES = [
  {
    value: "Researcher",
    label: "Researcher",
    desc: "Submit publications and track projects"
  },
  {
    value: "InstitutionAdmin",
    label: "Institution Admin",
    desc: "Manage institutional data and departments"
  },
  {
    value: "Reviewer",
    label: "Reviewer",
    desc: "Review and evaluate submitted work"
  },
  {
    value: "SystemAdmin",
    label: "System Admin",
    desc: "Full platform access and audit controls"
  },
];

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Researcher"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
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
        setError(
          "Registration failed because the backend is not reachable. Start or restart the backend server."
        );
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

        {/* =================================================
            REGISTER FORM
            ================================================= */}

        <section className="auth-shell">

          <div className="auth-copy-block">

            <p className="auth-kicker">
              New researcher access
            </p>

            <h1 className="auth-title">
              Create your account.
            </h1>

            <p className="auth-subtitle">
              Set up your access to the research collaboration workspace.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            {/* Email */}

            <label className="auth-field">

              <span>
                Email address
              </span>

              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="name@institution.edu"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="auth-input"
              />

            </label>


            {/* Password */}

            <label className="auth-field">

              <span>
                Password
              </span>

              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="Create a secure password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
                className="auth-input"
              />

            </label>


            {/* Role */}

            <label className="auth-field">

              <span>
                Account role
              </span>

              <select
                id="register-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="auth-input"
              >

                {ROLES.map(({ value, label }) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}

              </select>

            </label>


            {/* Role Description */}

            {form.role && (
              <div className="auth-role-desc">
                {ROLES.find(
                  (r) => r.value === form.role
                )?.desc}
              </div>
            )}


            {/* Error */}

            {error && (
              <p
                className="auth-error"
                role="alert"
              >
                {error}
              </p>
            )}


            {/* Actions */}

            <div className="auth-actions">

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="auth-button"
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}
              </button>

              <p className="auth-footer">
                Already have an account?{" "}
                <Link to="/login">
                  Sign in
                </Link>
              </p>

            </div>

          </form>

        </section>


        {/* =================================================
            BRAND / VISUAL PANEL
            ================================================= */}

        <aside className="auth-panel">

          {/* Brand */}

          <div className="auth-brand">

            <div className="auth-brand-mark">
              SN
            </div>

            <span className="auth-brand-name">
              Scientific Collaboration
            </span>

          </div>


          {/* Abstract Network */}

          <div className="auth-network-visual">

            <div className="auth-node" />
            <div className="auth-node" />
            <div className="auth-node" />
            <div className="auth-node" />
            <div className="auth-node" />

          </div>


          {/* Brand Content */}

          <div className="auth-panel-content">

            <div className="auth-panel-label">
              Research intelligence platform
            </div>

            <h2 className="auth-panel-title">
              Connect research.
              <br />
              Discover collaboration.
            </h2>

            <p className="auth-panel-copy">
              A unified workspace for researchers,
              institutions and publications.
            </p>

            <div className="auth-panel-meta">

              <span>Research</span>
              <span>Networks</span>
              <span>Publications</span>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}