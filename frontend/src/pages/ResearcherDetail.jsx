import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../config/api';

const ResearcherDetail = () => {
  const { id } = useParams();
  const [researcher, setResearcher] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResearcher();
  }, [id]);

  const fetchResearcher = async () => {
    try {
      const response = await api.get(`/researchers/${id}`);
      setResearcher(response.data);
    } catch (err) {
      alert('Researcher not found');
      navigate('/researchers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2><i className="bi bi-person-circle"></i> {researcher?.full_name || researcher?.user?.full_name || researcher?.user_full_name || 'Unknown researcher'}</h2>
              <hr />

              <div className="row mb-3">
                <div className="col-md-6">
                  <strong><i className="bi bi-briefcase"></i> Designation:</strong>
                  <p>{researcher.designation}</p>
                </div>
                <div className="col-md-6">
                  <strong><i className="bi bi-building"></i> Department:</strong>
                  <p>{researcher.department}</p>
                </div>
              </div>

              {researcher.bio && (
                <div className="mb-3">
                  <strong><i className="bi bi-file-text"></i> Bio:</strong>
                  <p>{researcher.bio}</p>
                </div>
              )}

              <div className="mb-3">
                <strong><i className="bi bi-gear"></i> Skills:</strong>
                <div>
                  {typeof researcher?.skills === 'string' && researcher.skills
                    ? researcher.skills.split(',').filter(Boolean).map((skill, i) => (
                        <span key={i} className="badge bg-info me-1">{skill.trim()}</span>
                      ))
                    : <span className="text-muted">No skills listed</span>}
                </div>
              </div>

              <div className="mb-3">
                <strong><i className="bi bi-lightbulb"></i> Research Interests:</strong>
                <div>
                  {typeof researcher?.research_interests === 'string' && researcher.research_interests
                    ? researcher.research_interests.split(',').filter(Boolean).map((interest, i) => (
                        <span key={i} className="badge bg-success me-1">{interest.trim()}</span>
                      ))
                    : <span className="text-muted">No research interests listed</span>}
                </div>
              </div>

              <div className="mb-3">
                <strong><i className="bi bi-graph-up"></i> H-Index:</strong>
                <p>{researcher?.h_index ?? 0}</p>
              </div>

              <div className="mb-3">
                <strong><i className="bi bi-building"></i> Institution:</strong>
                <p>{researcher?.institution_id ? <Link to={`/institutions/${researcher.institution_id}`}>{researcher.institution_name || 'View institution'}</Link> : <span className="text-muted">Not affiliated with an institution</span>}</p>
              </div>

              <div className="mb-3">
                <strong><i className="bi bi-envelope"></i> Email:</strong>
                  <p>{researcher?.email || 'Not available'}</p>
              </div>

              <div className="mt-4">
                <Link to="/researchers" className="btn btn-secondary">
                  <i className="bi bi-arrow-left"></i> Back to Researchers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearcherDetail;
