import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api, { API_BASE_URL } from '../config/api';
import { AuthContext } from '../context/AuthContext';

const normalizeRole = (role) => {
  if (!role) return '';
  if (typeof role === 'string') return role.toLowerCase();
  if (typeof role === 'object' && role?.value) return String(role.value).toLowerCase();
  return String(role).toLowerCase();
};

const canAccess = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const normalized = normalizeRole(userRole);
  return allowedRoles.map((r) => normalizeRole(r)).includes(normalized);
};

const PublicationsList = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { user } = useContext(AuthContext);
  const role = user ? normalizeRole(user.role) : null;

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await api.get('/publications/');
        setPublications(response.data);
      } catch (err) {
        console.error('Failed to fetch publications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  const updateStatus = async (pub, status) => {
    try {
      await api.put(`/publications/${pub.id}`, { ...pub, status });
      setPublications((items) => items.map((item) => item.id === pub.id ? { ...item, status } : item));
    } catch (err) { alert(err.response?.data?.detail || 'Unable to update publication'); }
  };
  const deletePublication = async (id) => {
    if (!window.confirm('Delete this publication?')) return;
    try { await api.delete(`/publications/${id}`); setPublications((items) => items.filter((item) => item.id !== id)); }
    catch (err) { alert(err.response?.data?.detail || 'Unable to delete publication'); }
  };
  const viewReviews = async (id) => {
    try {
      const { data } = await api.get(`/reviews/publication/${id}`);
      alert(data.length ? data.map((review) => `${review.rating || 'No'} stars · ${review.recommendation || 'undecided'}\n${review.comments || 'No comments'}`).join('\n\n') : 'No completed reviews yet.');
    } catch (err) { alert(err.response?.data?.detail || 'Unable to load reviews'); }
  };

  if (loading) return <div className="container mt-5"><div className="spinner-border" /></div>;

  const filtered = publications.filter((pub) => (!statusFilter || pub.status === statusFilter) && (!typeFilter || pub.publication_type === typeFilter));
  const owns = (pub) => role === 'system_admin' || (role === 'researcher' && pub.created_by_id === user?.id);
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Publications</h2>
        {canAccess(role, ['researcher', 'system_admin']) && (
          <Link to="/publications/create" className="btn btn-primary">
            <i className="bi bi-plus-circle"></i> New Publication
          </Link>
        )}
      </div>

      <div className="d-flex gap-2 mb-3">
        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">All statuses</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="published">Published</option></select>
        <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="">All types</option><option value="journal">Journal</option><option value="conference">Conference</option><option value="book">Book</option></select>
      </div>
      <div className="row">
        {filtered.length === 0 ? (
          <p>No publications found.</p>
        ) : (
          filtered.map(pub => (
            <div key={pub.id} className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title text-primary">{pub.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{pub.publication_type} • {pub.status}</h6>
                  <p className="card-text">{pub.abstract?.substring(0, 100)}...</p>
                  {pub.file_path && (
                    <a href={`${API_BASE_URL}${pub.file_path.startsWith('/') ? pub.file_path : `/${pub.file_path.replace(/\\/g, '/')}`}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                      <i className="bi bi-file-earmark-pdf"></i> View PDF
                    </a>
                  )}
                  {owns(pub) && <div className="mt-3 d-flex gap-2 align-items-center"><select className="form-select form-select-sm" value={pub.status} onChange={(e) => updateStatus(pub, e.target.value)}><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="published">Published</option></select><button className="btn btn-sm btn-outline-secondary" onClick={() => viewReviews(pub.id)}>Reviews</button><button className="btn btn-sm btn-outline-danger" onClick={() => deletePublication(pub.id)}>Delete</button></div>}
                </div>
                <div className="card-footer bg-white text-muted small">
                  Published: {pub.published_date ? new Date(pub.published_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicationsList;
