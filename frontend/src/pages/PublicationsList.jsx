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

  if (loading) return <div className="container mt-5"><div className="spinner-border" /></div>;

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

      <div className="row">
        {publications.length === 0 ? (
          <p>No publications found.</p>
        ) : (
          publications.map(pub => (
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
