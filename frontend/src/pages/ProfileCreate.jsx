import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import '../styles/forms.css';

const ProfileCreate = () => {
  const [institutions, setInstitutions] = useState([]);  // ✅ ADD THIS
  const [formData, setFormData] = useState({
    department: '',
    designation: '',
    bio: '',
    skills: '',
    research_interests: '',
    institution_id: null, 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [requestedRole, setRequestedRole] = useState(user?.requested_role || 'researcher');

  // ✅ ADD THIS USEEFFECT
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // ✅ ADD THIS FUNCTION
  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions/?limit=1000');
      setInstitutions(response.data);
    } catch (err) {
      console.error('Failed to fetch institutions');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'institution_id' ? (value ? parseInt(value) : null) : value  // ✅ UPDATED
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/researchers/profile', formData);
      if (requestedRole !== 'researcher' && requestedRole !== user?.role) {
        await api.put('/researchers/profile/me/role-request', { requested_role: requestedRole });
      }
      alert('Profile created successfully!');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card" style={{ maxWidth: '600px' }}>
        <h2 className="form-title"><i className="bi bi-person-plus"></i> Create Researcher Profile</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-building"></i> Department *</label>
            <input
              type="text"
              className="form-control"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Requested platform role</label>
            <select className="form-control" value={requestedRole} onChange={(e) => setRequestedRole(e.target.value)} disabled={loading}>
              <option value="researcher">Researcher</option>
              <option value="reviewer">Reviewer</option>
              <option value="institution_admin">Institution administrator</option>
            </select>
            <small className="text-muted">You keep researcher access until a system administrator approves a requested role.</small>
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-briefcase"></i> Designation *</label>
            <input
              type="text"
              className="form-control"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g., Assistant Professor"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-file-text"></i> Bio</label>
            <textarea
              className="form-control"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Write a short bio..."
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-gear"></i> Skills (comma-separated) *</label>
            <input
              type="text"
              className="form-control"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., Python, Machine Learning"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-lightbulb"></i> Research Interests (comma-separated) *</label>
            <input
              type="text"
              className="form-control"
              name="research_interests"
              value={formData.research_interests}
              onChange={handleChange}
              placeholder="e.g., AI, Quantum Computing"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-building"></i> Institution (Optional)</label>
            <select
              className="form-control"
              name="institution_id"
              value={formData.institution_id || ''}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">-- Select Institution --</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
            <small className="text-muted">Don't see your institution? <Link to="/institutions/create">Create one</Link></small>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCreate;
