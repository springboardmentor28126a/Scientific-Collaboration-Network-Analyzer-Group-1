import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

/** Two-stage invitation dialog. Opening it never creates a request. */
export default function CollaborationRequestModal({ researcher, onClose }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [step, setStep] = useState('select');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const selectedProject = projects.find((project) => String(project.id) === String(selectedProjectId));

  useEffect(() => {
    api.get('/collaborations/projects/eligible-to-invite')
      .then((response) => setProjects(response.data || []))
      .catch((err) => setError(err.response?.data?.detail || 'Unable to load your projects.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedProject) return;
    setSending(true); setError('');
    try {
      await api.post('/collaborations/request', {
        receiver_id: researcher.user_id,
        project_id: selectedProject.id,
        collaboration_type: 'Project',
        message: message.trim() || null,
      });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to send collaboration request.');
    } finally { setSending(false); }
  };

  return <div className="modal d-block" role="dialog" aria-modal="true" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
    <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
      <div className="modal-header"><h5 className="modal-title">{step === 'request' ? 'Collaboration Request' : 'Select a Project'}</h5><button type="button" className="btn-close" onClick={onClose} aria-label="Close" /></div>
      <div className="modal-body">
        {loading && <div className="text-center py-3"><div className="spinner-border text-primary" /><p className="mt-2 mb-0">Loading available projects...</p></div>}
        {!loading && error && <div className="alert alert-danger">{error}</div>}
        {!loading && step === 'select' && !error && (projects.length ? <>
          <p className="text-muted">Choose a project you own to invite <strong>{researcher.name}</strong> to.</p>
          <div className="list-group">{projects.map((project) => <label className={`list-group-item list-group-item-action ${String(selectedProjectId) === String(project.id) ? 'active' : ''}`} key={project.id}>
            <input className="form-check-input me-2" type="radio" name="project" value={project.id} checked={String(selectedProjectId) === String(project.id)} onChange={(event) => setSelectedProjectId(event.target.value)} />
            <strong>{project.title}</strong><div className="small">{project.description || 'No description provided.'}</div><div className="small mt-1">{project.status?.replace('_', ' ')} · {project.member_count ?? 0} members</div>
          </label>)}</div>
        </> : <div className="alert alert-info mb-0">You don't have any projects available for collaboration requests. Create or join a project first.<div className="mt-2"><Link className="btn btn-primary btn-sm" to="/collaborations" onClick={onClose}>Create Project</Link></div></div>)}
        {!loading && step === 'request' && selectedProject && <form id="collaboration-request-form" onSubmit={submit}>
          <p><strong>Collaborate with:</strong> {researcher.name}<br /><strong>Selected Project:</strong> {selectedProject.title}</p>
          <label className="form-label" htmlFor="collaboration-message">Message <span className="text-muted">(optional)</span></label>
          <textarea id="collaboration-message" className="form-control" rows="4" placeholder="I'd like to invite you to collaborate on this project..." value={message} onChange={(event) => setMessage(event.target.value)} />
        </form>}
        {!loading && step === 'success' && <div className="alert alert-success mb-0">Collaboration request sent successfully.</div>}
      </div>
      <div className="modal-footer">
        {step === 'select' && <><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!selectedProjectId || loading || !!error} onClick={() => setStep('request')}>Continue</button></>}
        {step === 'request' && <><button className="btn btn-outline-secondary" disabled={sending} onClick={() => { setError(''); setStep('select'); }}>Back</button><button className="btn btn-primary" type="submit" form="collaboration-request-form" disabled={sending}>{sending ? 'Sending...' : 'Send Collaboration Request'}</button></>}
        {step === 'success' && <button className="btn btn-primary" onClick={onClose}>Done</button>}
      </div>
    </div></div>
  </div>;
}
