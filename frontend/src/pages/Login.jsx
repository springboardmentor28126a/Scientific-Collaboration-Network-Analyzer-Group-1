import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import '../styles/forms.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      const formData = new URLSearchParams();
      formData.append('username', normalizedEmail);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const userData = response.data?.user || { email: normalizedEmail };
      login(response.data.access_token, userData);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="text-center mb-4">
          <i className="bi bi-graph" style={{ fontSize: '3rem', color: '#667eea' }}></i>
          <h2 className="mt-3">SCNA</h2>
          <p className="text-muted">Scientific Collaboration Platform</p>
        </div>

        <h3 className="form-title"><i className="bi bi-lock"></i> Login</h3>
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-circle"></i> {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <i className="bi bi-envelope"></i> Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <i className="bi bi-key"></i> Password
            </label>
            <div className="input-group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 mb-3" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i> Login
              </>
            )}
          </button>
        </form>

        <hr />

        <div className="text-center">
          <p className="mb-0">
            Don't have an account? 
            <br />
            <Link to="/register" className="btn btn-link p-0">
              <strong>Register here</strong>
            </Link>
          </p>
        </div>

        <hr />
      </div>
    </div>
  );
};

export default Login;