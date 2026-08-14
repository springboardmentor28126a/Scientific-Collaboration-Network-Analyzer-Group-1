import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import '../styles/cards.css';

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleRequests, setRoleRequests] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [response, requestsResponse] = await Promise.all([api.get('/researchers/profile/me'), api.get('/researchers/profile/me/role-requests')]);
      setProfile(response.data); setRoleRequests(requestsResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  const latestRoleRequest = roleRequests[0];
  const resubmit = async () => {
    try {
      await api.post(`/researchers/profile/me/role-requests/${latestRoleRequest.id}/resubmit`);
      await fetchProfile();
    } catch (err) { setError(err.response?.data?.detail || 'Unable to resubmit role request'); }
  };

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
                {latestRoleRequest?.status === 'pending' && <div className="alert alert-warning">Role request for <strong>{latestRoleRequest.requested_role?.replace('_', ' ')}</strong> is awaiting administrator approval. Your current role remains researcher.</div>}
                {latestRoleRequest?.status === 'rejected' && <div className="alert alert-danger"><h5>Role Request Status: Rejected</h5><p className="mb-2">{latestRoleRequest.rejection_reason}</p><Link className="btn btn-outline-primary btn-sm me-2" to="/profile/edit">Edit Profile</Link><button className="btn btn-primary btn-sm" onClick={resubmit}>Resubmit Request</button></div>}
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
                  <strong><i className="bi bi-building"></i> Institution:</strong>
                  <p>{profile.institution_id ? <Link to={`/institutions/${profile.institution_id}`}>{profile.institution_name || 'View institution'}</Link> : <span className="text-muted">No institution selected</span>}</p>
                </div>
                {roleRequests.length > 0 && <div className="mt-4"><h5>Role Request History</h5><ul className="list-group">{roleRequests.map((item) => <li className="list-group-item" key={item.id}><strong>{item.requested_role.replace('_', ' ')}</strong> <span className={`badge ms-2 ${item.status === 'approved' ? 'bg-success' : item.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>{item.status}</span><div className="small text-muted">Submitted {new Date(item.submitted_at).toLocaleString()}{item.reviewed_at ? ` · Reviewed ${new Date(item.reviewed_at).toLocaleString()}` : ''}</div>{item.rejection_reason && <div className="small mt-1">Reason: {item.rejection_reason}</div>}</li>)}</ul></div>}
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
