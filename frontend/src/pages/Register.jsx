import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api';
import '../styles/forms.css';

const errorMessage = (detail) => {
  if (Array.isArray(detail)) return detail.map((item) => item.msg || 'Invalid input').join('. ');
  return typeof detail === 'string' ? detail : 'Registration failed';
};

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    requested_role: 'researcher',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim(),
        password: formData.password.trim(),
        requested_role: formData.requested_role,
      };

      await api.post('/auth/register', payload);
      alert(formData.requested_role === 'researcher' ? 'Registration successful! Please login.' : 'Registration successful. You can use researcher features while your requested role is awaiting administrator approval.');
      navigate('/login');
    } catch (err) {
      setError(errorMessage(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2 className="form-title"><i className="bi bi-person-plus"></i> Create Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Requested role</label>
            <select className="form-select" name="requested_role" value={formData.requested_role} onChange={handleChange} disabled={loading}>
              <option value="researcher">Researcher</option>
             {/* <option value="reviewer">Reviewer (administrator approval required)</option> */}
             {/*} <option value="institution_admin">Institution administrator (administrator approval required)</option>*/}
            </select>
            <small className="text-muted">Every new account starts as a researcher. Elevated access is granted only after approval.</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <hr />
        <p className="text-center">
          Already have an account? <Link to="/login"><strong>Login here</strong></Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
