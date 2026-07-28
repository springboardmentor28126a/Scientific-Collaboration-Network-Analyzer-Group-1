import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { registerUser } from "../services/authService";
import { fetchInstitutions } from "../services/institutionService";
import { fetchDepartmentsByInstitution } from "../services/departmentService";
import { fetchDepartmentsByInstitutionPublic } from "../services/departmentService";
import "../styles/auth.css";

function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    institution_id: "",
    department_id: "",
  });

  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstitutions()
      .then(setInstitutions)
      .catch(() => toast.error("Could not load institutions."));
  }, []);

  useEffect(() => {
  if (!form.institution_id) {
    setDepartments([]);
    return;
  }
  fetchDepartmentsByInstitutionPublic(form.institution_id)
    .then(setDepartments)
    .catch(() => toast.error("Could not load departments."));
}, [form.institution_id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        institution_id: Number(form.institution_id),
        department_id: Number(form.department_id),
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card-center">
          <span className="auth-status-badge">Pending</span>
          <h1>Your account is pending approval</h1>
          <p className="auth-sub">
            Your institution's admin needs to approve your account before you can log in.
            You'll be able to sign in as soon as that happens.
          </p>
          <Link to="/" className="btn-primary btn-block">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1>Register as a researcher</h1>
        <p className="auth-sub">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-grid-2">
            <div>
              <label>First name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} required />
            </div>
            <div>
              <label>Last name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} required />
            </div>
          </div>

          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />

          <div className="auth-grid-2">
            <div>
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
            <div>
              <label>Confirm password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <label>Institution</label>
          <select name="institution_id" value={form.institution_id} onChange={handleChange} required>
            <option value="">Select institution</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>{i.institution_name}</option>
            ))}
          </select>

          <label>Department</label>
          <select
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            required
            disabled={!form.institution_id}
          >
            <option value="">
              {form.institution_id ? "Select department" : "Select an institution first"}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.department_name}</option>
            ))}
          </select>

          <p className="auth-hint">Passwords need 8+ characters, uppercase, lowercase, a number, and a symbol.</p>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;