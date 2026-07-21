import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const PublicationCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    publication_type: 'journal',
    status: 'draft',
    published_date: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the publication entry
      const payload = {
        ...formData,
        published_date: formData.published_date ? new Date(formData.published_date).toISOString() : null
      };
      const res = await api.post('/publications/', payload);
      
      // 2. Upload file if provided
      if (file && res.data.id) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        await api.post(`/publications/${res.data.id}/upload`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/publications');
    } catch (err) {
      alert('Error creating publication: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0 max-w-2xl mx-auto">
        <div className="card-body p-4">
          <h2 className="mb-4">Create Publication</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Abstract</label>
              <textarea className="form-control" rows="4" value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})}></textarea>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Type</label>
                <select className="form-control" value={formData.publication_type} onChange={e => setFormData({...formData, publication_type: e.target.value})}>
                  <option value="journal">Journal</option>
                  <option value="conference">Conference</option>
                  <option value="book">Book</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Published Date</label>
              <input type="date" className="form-control" value={formData.published_date} onChange={e => setFormData({...formData, published_date: e.target.value})} />
            </div>
            <div className="mb-4">
              <label className="form-label">PDF File Upload</label>
              <input type="file" className="form-control" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Saving...' : 'Create Publication'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicationCreate;
