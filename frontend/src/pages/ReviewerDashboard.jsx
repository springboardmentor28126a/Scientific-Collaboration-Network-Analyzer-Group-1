import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const label = (value) => ({ pending: 'Pending', draft: 'Under review', completed: 'Completed', revision_required: 'Revision required' }[value] || value);

export default function ReviewerDashboard() {
  const [stats, setStats] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/dashboard/stats').then(r => setStats(r.data)).catch(e => setError(e.response?.data?.detail || 'Unable to load your review workload.')); }, []);
  const cards = [['Pending Reviews', stats?.pending_reviews, 'warning'], ['Under Review', stats?.under_review_count, 'primary'], ['Completed Reviews', stats?.completed_reviews, 'success'], ['Revision Required', stats?.revision_required_count, 'danger']];
  return <div className="container py-5"><div className="mb-4"><h1>Reviewer Dashboard</h1><p className="text-muted">Your assigned peer-review workload and next actions.</p></div>{error && <div className="alert alert-danger">{error}</div>}<div className="row mb-4">{cards.map(([name, value, color]) => <div className="col-md-3 mb-3" key={name}><div className={`card border-${color} shadow-sm h-100`}><div className="card-body"><div className="text-muted">{name}</div><div className="display-6 fw-semibold">{stats ? value || 0 : '—'}</div></div></div></div>)}</div><div className="card shadow-sm"><div className="card-header bg-white d-flex justify-content-between"><h5 className="mb-0">Recent Review Assignments</h5><Link className="btn btn-sm btn-primary" to="/reviews/assigned">View all</Link></div><div className="table-responsive"><table className="table mb-0"><thead><tr><th>Publication</th><th>Due date</th><th>Status</th><th /></tr></thead><tbody>{(stats?.recent_review_assignments || []).map(r => <tr key={r.id}><td>{r.publication_title}</td><td>{r.due_date ? new Date(r.due_date).toLocaleDateString() : 'Not specified'}</td><td><span className="badge bg-secondary">{label(r.status)}</span></td><td><Link className="btn btn-sm btn-outline-primary" to={`/reviews/${r.id}`}>{r.status === 'pending' ? 'Start review' : 'View review'}</Link></td></tr>)}{stats && !stats.recent_review_assignments?.length && <tr><td colSpan="4" className="text-center text-muted py-4">No review assignments yet.</td></tr>}</tbody></table></div></div></div>;
}
