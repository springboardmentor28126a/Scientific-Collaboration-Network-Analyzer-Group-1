import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/cards.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container py-5">
      <div className="hero-section">
        <h1><i className="bi bi-graph"></i> Welcome, {user?.full_name}!</h1>
        <p className="lead">Manage your research collaborations and academic network</p>
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
        
        <div className="col-md-3">
          <div className="dashboard-card disabled">
            <i className="bi bi-book"></i>
            <h5>Publications</h5>
            <p>Manage publications</p>
            <button className="btn btn-sm btn-primary" disabled>Week 3</button>
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
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><i className="bi bi-bar-chart"></i> Quick Stats</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li><i className="bi bi-file-earmark"></i> <strong>Publications:</strong> 0</li>
                <li><i className="bi bi-people"></i> <strong>Collaborators:</strong> 0</li>
                <li><i className="bi bi-trophy"></i> <strong>H-Index:</strong> 0</li>
                <li><i className="bi bi-chat-dots"></i> <strong>Conferences:</strong> 0</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info mt-4">
        <h5><i className="bi bi-info-circle"></i> Milestone 1 Completion</h5>
        <p>✅ Week 1-2: Authentication & Researcher Profiles Completed</p>
        <p>📅 Week 3-4: Publications & Conference Management</p>
      </div>
    </div>
  );
};

export default Dashboard;