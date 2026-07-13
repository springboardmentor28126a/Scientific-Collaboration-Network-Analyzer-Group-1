import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import '../styles/forms.css';

const ProfileEdit = () => {
  
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await api.get('/researchers/profile/me');
      setProfile(profileRes.data);
      setFormData(profileRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch profile');
      setTimeout(() => navigate('/profile'), 2000);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'h_index' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const updateData = {};
    Object.keys(formData).forEach((key) => {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
        if (formData[key] !== profile[key]) {
          updateData[key] = formData[key];
        }
      }
    });

    try {
      await api.put('/researchers/profile/me', updateData);
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="form-container">
      <div className="form-card" style={{ maxWidth: '600px' }}>
        <h2 className="form-title"><i className="bi bi-pencil-square"></i> Edit Researcher Profile</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-building"></i> Department</label>
            <input
              type="text"
              className="form-control"
              name="department"
              value={formData.department || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-briefcase"></i> Designation</label>
            <input
              type="text"
              className="form-control"
              name="designation"
              value={formData.designation || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-file-text"></i> Bio</label>
            <textarea
              className="form-control"
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              rows="4"
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-gear"></i> Skills</label>
            <input
              type="text"
              className="form-control"
              name="skills"
              value={formData.skills || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-lightbulb"></i> Research Interests</label>
            <input
              type="text"
              className="form-control"
              name="research_interests"
              value={formData.research_interests || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-graph-up"></i> H-Index</label>
            <input
              type="number"
              className="form-control"
              name="h_index"
              value={formData.h_index || 0}
              onChange={handleChange}
              min="0"
              disabled={loading}
            />
          </div>

          

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/profile')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;