import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import '../styles/cards.css';

const ResearchersList = () => {
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResearchers();
  }, []);

  const fetchResearchers = async () => {
    try {
      const response = await api.get('/researchers/?limit=1000');
      setResearchers(response.data);
    } catch (err) {
      console.error('Failed to fetch researchers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4"><i className="bi bi-people"></i> Researchers Directory</h2>

      <div className="row">
        {researchers.length > 0 ? (
          researchers.map((researcher) => {
            const fullName = researcher?.full_name || researcher?.user?.full_name || researcher?.user_full_name || 'Unknown researcher';
            const skills = typeof researcher?.skills === 'string' && researcher.skills
              ? researcher.skills.split(',').filter(Boolean)
              : [];

            return (
              <div key={researcher.id} className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title"><i className="bi bi-person-circle"></i> {fullName}</h5>
                    <p className="card-text">
                      <strong>{researcher.designation || 'No designation provided'}</strong><br />
                      <small className="text-muted">{researcher.department || 'No department provided'}</small>
                    </p>
                    <p className="card-text">
                      <small>
                        <i className="bi bi-gear"></i>
                        {skills.length > 0 ? skills.map((skill, i) => (
                          <span key={i} className="badge bg-info me-1">{skill.trim()}</span>
                        )) : <span className="text-muted">No skills listed</span>}
                      </small>
                    </p>
                    <p>
                      <small><i className="bi bi-graph-up"></i> H-Index: <strong>{researcher.h_index ?? 0}</strong></small>
                    </p>
                  </div>
                  <div className="card-footer">
                    <Link to={`/researchers/${researcher.id}`} className="btn btn-sm btn-primary">
                      <i className="bi bi-eye"></i> View Profile
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="alert alert-info">No researchers found yet.</div>
        )}
      </div>
    </div>
  );
};

export default ResearchersList;