import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const ConferenceCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    status: 'upcoming'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/conferences/', formData);
      navigate('/conferences');
    } catch (err) {
      alert('Error creating conference: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0 max-w-2xl mx-auto">
        <div className="card-body p-4">
          <h2 className="mb-4">Create Conference</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">Status</label>
              <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Saving...' : 'Create Conference'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConferenceCreate;
