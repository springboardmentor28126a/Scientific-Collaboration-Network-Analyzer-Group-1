import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import '../styles/cards.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const role = user?.role || 'researcher';
  useEffect(() => { api.get('/dashboard/stats').then((r) => setStats(r.data)).catch(() => setStats({})); }, []);
  const researcherCards = [
    ['Publications', stats?.publications_count, 'bi-journal-text', '/publications'], ['Conference registrations', stats?.conferences_count, 'bi-calendar-check', '/conferences'],
    ['H-index', stats?.h_index, 'bi-graph-up', '/profile'], ['Active projects', stats?.active_projects || 0, 'bi-folder2-open', '/collaborations'],
  ];
  const reviewerCards = [['Pending reviews', stats?.pending_reviews, 'bi-hourglass-split', '/review-queue'], ['Completed reviews', stats?.completed_reviews, 'bi-check2-circle', '/review-queue']];
  const adminCards = [['Institution publications', stats?.publications_count, 'bi-journal-text', '/publications'], ['Active researchers', stats?.researchers_count, 'bi-people', '/researchers'], ['Collaborations', stats?.collaboration_count, 'bi-diagram-3', '/collaborations'], ['Active projects', stats?.active_projects || 0, 'bi-folder2-open', '/collaborations']];
  const cards = role === 'reviewer' ? reviewerCards : role === 'institution_admin' ? adminCards : researcherCards;
  const title = role === 'reviewer' ? 'Review workspace' : role === 'institution_admin' ? 'Institution management workspace' : 'Research workspace';
  return <div className="container py-5">
    <div className="hero-section"><h1><i className="bi bi-graph"></i> Welcome, {user?.full_name}!</h1><p className="lead">{title}</p></div>
    {user?.role_request_status === 'pending' && <div className="alert alert-warning">Your request for {user?.requested_role?.replace('_', ' ')} access is pending approval. You currently have researcher permissions.</div>}
    <div className="row mb-4">{cards.map(([label, value, icon, link]) => <div className="col-md-3 mb-3" key={label}><div className="dashboard-card"><i className={`bi ${icon}`}></i><h5>{label}</h5><h2>{stats ? value ?? 0 : '—'}</h2><Link to={link} className="btn btn-sm btn-primary">Open</Link></div></div>)}</div>
    <div className="row"><div className="col-md-8"><div className="card"><div className="card-header bg-primary text-white"><h5 className="mb-0"><i className="bi bi-clock-history"></i> Recent activity</h5></div><div className="card-body text-muted">Recent publication, conference, and review activity will appear here as you use the platform.</div></div></div>
    <div className="col-md-4"><div className="card"><div className="card-body"><h5>Quick actions</h5><Link className="btn btn-outline-primary btn-sm me-2 mb-2" to="/profile">My profile</Link><Link className="btn btn-outline-primary btn-sm me-2 mb-2" to="/publications">Publications</Link><Link className="btn btn-outline-primary btn-sm me-2 mb-2" to="/collaborations">Projects</Link><Link className="btn btn-outline-primary btn-sm mb-2" to="/citations">Citations</Link></div></div></div></div>
  </div>;
};
export default Dashboard;
