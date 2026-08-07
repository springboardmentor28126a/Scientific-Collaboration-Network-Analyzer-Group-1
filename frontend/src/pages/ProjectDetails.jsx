import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [inviteForm, setInviteForm] = useState({
    receiver_id: '',
    message: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [projRes, membersRes, researchersRes] = await Promise.all([
        api.get(`/collaborations/projects/${id}`),
        api.get(`/collaborations/projects/${id}/members`),
        api.get('/researchers')
      ]);
      setProject(projRes.data);
      setMembers(membersRes.data);
      const memberIds = membersRes.data.map(m => m.researcher_id);
      setResearchers(researchersRes.data.filter(r => !memberIds.includes(r.user_id) && r.user_id !== user.id));
      setError('');
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMsg('');
      await api.post('/collaborations/request', {
        receiver_id: parseInt(inviteForm.receiver_id),
        project_id: parseInt(id),
        collaboration_type: 'Project',
        message: inviteForm.message
      });
      setSuccessMsg('Invitation sent successfully!');
      setInviteForm({ receiver_id: '', message: '' });
      await loadData();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to send invitation');
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/collaborations/projects/${id}/members/${memberId}`);
      loadData();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to remove member');
    }
  };

  const leaveProject = async () => {
    if (!window.confirm("Are you sure you want to leave this project?")) return;
    try {
      await api.post(`/collaborations/projects/${id}/leave`);
      navigate('/collaborations');
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to leave project');
    }
  };

  if (loading) return <div className="container py-5">Loading project...</div>;
  if (!project) return <div className="container py-5"><div className="alert alert-danger">{error || 'Project not found.'}</div></div>;

  const isOwner = project.created_by === user.id || user.role === 'system_admin';
  const isMember = members.some(m => m.researcher_id === user.id);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-2" onClick={() => navigate('/collaborations')}>&larr; Back to Hub</button>
          <h2>{project.title}</h2>
          <span className="badge bg-info text-dark">{project.status.replace('_', ' ')}</span>
        </div>
        <div>
          {isMember && !isOwner && <button className="btn btn-warning" onClick={leaveProject}>Leave Project</button>}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header"><strong>Project Details</strong></div>
            <div className="card-body">
              <p>{project.description || 'No description provided.'}</p>
              <div className="row mt-3">
                <div className="col-sm-6">
                  <small className="text-muted d-block">Start Date</small>
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                </div>
                <div className="col-sm-6">
                  <small className="text-muted d-block">End Date</small>
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header"><strong>Team Members ({members.length})</strong></div>
            <div className="list-group list-group-flush">
              {members.map(m => (
                <div key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{m.researcher_name}</strong>
                    <div className="small text-muted">Role: {m.role}</div>
                  </div>
                  <div>
                    {isOwner && m.researcher_id !== project.created_by && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeMember(m.id)}>Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {isOwner && (
            <div className="card shadow-sm">
              <div className="card-header"><strong>Invite Researcher</strong></div>
              <div className="card-body">
                <form onSubmit={handleInvite}>
                  <div className="mb-3">
                    <label className="form-label">Select Researcher</label>
                    <select 
                      className="form-select" 
                      value={inviteForm.receiver_id} 
                      onChange={e => setInviteForm({...inviteForm, receiver_id: e.target.value})}
                      required
                    >
                      <option value="">-- Choose a researcher --</option>
                      {researchers.map(r => (
                        <option key={r.user_id} value={r.user_id}>{r.full_name} ({r.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Invitation Message (Optional)</label>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      placeholder="Hi, I'd like to invite you..."
                      value={inviteForm.message}
                      onChange={e => setInviteForm({...inviteForm, message: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={!inviteForm.receiver_id}>
                    Send Invitation
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
