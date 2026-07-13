import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import '../styles/cards.css';

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/researchers/profile/me');
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-5">
      {error && (
        <div className="alert alert-info">
          <h4><i className="bi bi-exclamation-circle"></i> No Profile Found</h4>
          <p>You haven't created a researcher profile yet.</p>
          <Link to="/profile/create" className="btn btn-primary">
            <i className="bi bi-plus-circle"></i> Create Profile Now
          </Link>
        </div>
      )}

      {profile && (
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0"><i className="bi bi-person-circle"></i> Researcher Profile</h4>
                <Link to="/profile/edit" className="btn btn-sm btn-light">
                  <i className="bi bi-pencil"></i> Edit
                </Link>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong><i className="bi bi-building"></i> Department:</strong>
                    <p>{profile.department}</p>
                  </div>
                  <div className="col-md-6">
                    <strong><i className="bi bi-briefcase"></i> Designation:</strong>
                    <p>{profile.designation}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <strong><i className="bi bi-file-text"></i> Bio:</strong>
                  <p>{profile.bio || 'N/A'}</p>
                </div>
                <div className="mb-3">
                  <strong><i className="bi bi-gear"></i> Skills:</strong>
                  <div>
                    {typeof profile.skills === 'string' && profile.skills
                      ? profile.skills.split(',').filter(Boolean).map((skill, i) => (
                          <span key={i} className="badge bg-info me-1">{skill.trim()}</span>
                        ))
                      : <span className="text-muted">No skills listed</span>}
                  </div>
                </div>
                <div className="mb-3">
                  <strong><i className="bi bi-lightbulb"></i> Research Interests:</strong>
                  <div>
                    {typeof profile.research_interests === 'string' && profile.research_interests
                      ? profile.research_interests.split(',').filter(Boolean).map((interest, i) => (
                          <span key={i} className="badge bg-success me-1">{interest.trim()}</span>
                        ))
                      : <span className="text-muted">No research interests listed</span>}
                  </div>
                </div>
                <div className="mb-3">
                  <strong><i className="bi bi-graph-up"></i> H-Index:</strong>
                  <p>{profile.h_index ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;