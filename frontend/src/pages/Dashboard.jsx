import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/cards.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role || 'researcher';
  const dashboardLabel = {
    researcher: 'Personal research workspace',
    institution_admin: 'Institution management workspace',
    reviewer: 'Review workspace',
    system_admin: 'Global system workspace',
  }[role] || 'Research workspace';

  return (
    <div className="container py-5">
      <div className="hero-section">
        <h1><i className="bi bi-graph"></i> Welcome, {user?.full_name}!</h1>
        <p className="lead">{dashboardLabel}</p>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="dashboard-card">
            <i className="bi bi-person-check"></i>
            <h5>My Profile</h5>
            <p>View and manage your researcher profile</p>
            <Link to="/profile" className="btn btn-sm btn-primary">Go to Profile</Link>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card">
            <i className="bi bi-people"></i>
            <h5>Researchers</h5>
            <p>Browse and discover researchers</p>
            <Link to="/researchers" className="btn btn-sm btn-primary">View All</Link>
          </div>
        </div>
        {/* ✅ ADD THIS INSTITUTIONS CARD */}
        <div className="col-md-3">
          <div className="dashboard-card">
            <i className="bi bi-building"></i>
            <h5>Institutions</h5>
            <p>Explore research institutions</p>
            <Link to="/institutions" className="btn btn-sm btn-primary">View All</Link>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card">
            <i className="bi bi-book"></i>
            <h5>Publications</h5>
            <p>Manage your research publications</p>
            <Link to="/publications" className="btn btn-sm btn-primary">View All</Link>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><i className="bi bi-clock-history"></i> Recent Activity</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Your recent activities will appear here</p>
            </div>
          </div>
        </div>
        
      </div>

     
    </div>
  );
};

export default Dashboard;
