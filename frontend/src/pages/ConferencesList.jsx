import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
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

const ConferencesList = () => {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const role = user ? normalizeRole(user.role) : null;

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const response = await api.get('/conferences/');
        setConferences(response.data);
      } catch (err) {
        console.error('Failed to fetch conferences:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConferences();
  }, []);

  const handleRegister = async (confId) => {
    try {
      await api.post(`/conferences/${confId}/register`, {
        presentation_title: null,
        presentation_abstract: null
      });
      alert('Successfully registered!');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return <div className="container mt-5"><div className="spinner-border" /></div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Conferences</h2>
        {canAccess(role, ['institution_admin', 'system_admin']) && (
          <Link to="/conferences/create" className="btn btn-primary">
            <i className="bi bi-plus-circle"></i> New Conference
          </Link>
        )}
      </div>

      <div className="row">
        {conferences.length === 0 ? (
          <p>No conferences found.</p>
        ) : (
          conferences.map(conf => (
            <div key={conf.id} className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title text-purple-600">{conf.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{conf.location} • {conf.date}</h6>
                  <p className="card-text">{conf.description}</p>
                </div>
                <div className="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
                  <span className="badge bg-secondary">{conf.status}</span>
                  {canAccess(role, ['researcher', 'system_admin']) && <button onClick={() => handleRegister(conf.id)} className="btn btn-sm btn-outline-primary">Register</button>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConferencesList;
