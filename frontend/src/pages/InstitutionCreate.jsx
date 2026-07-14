import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import '../styles/forms.css';

const InstitutionCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      await api.post('/institutions/', formData);
      alert('Institution created successfully!');
      navigate('/institutions');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create institution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card" style={{ maxWidth: '600px' }}>
        <h2 className="form-title"><i className="bi bi-building"></i> Create New Institution</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Institution Name *</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., MIT, Stanford University"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe the institution..."
              disabled={loading}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Country *</label>
            <input
              type="text"
              className="form-control"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g., USA"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">City *</label>
            <input
              type="text"
              className="form-control"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Boston"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Website</label>
            <input
              type="url"
              className="form-control"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              disabled={loading}
            />
          </div>
          
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/institutions')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionCreate;