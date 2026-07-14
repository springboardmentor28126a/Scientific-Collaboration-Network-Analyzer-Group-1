import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import '../styles/cards.css';

const InstitutionsList = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions/?limit=1000');
      setInstitutions(response.data);
    } catch (err) {
      console.error('Failed to fetch institutions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-building"></i> Research Institutions</h2>
        <Link to="/institutions/create" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Add Institution
        </Link>
      </div>

      <div className="row">
        {institutions.length > 0 ? (
          institutions.map((inst) => (
            <div key={inst.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title"><i className="bi bi-building"></i> {inst.name}</h5>
                  <p className="card-text">{inst.description || 'No description'}</p>
                  <p>
                    <small><i className="bi bi-geo-alt"></i> {inst.city}, {inst.country}</small><br />
                    {inst.website && (
                      <small><a href={inst.website} target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-globe"></i> Visit Website
                      </a></small>
                    )}
                  </p>
                </div>
                <div className="card-footer">
                  <Link to={`/institutions/${inst.id}`} className="btn btn-sm btn-primary">
                    <i className="bi bi-eye"></i> View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="alert alert-info">No institutions found.</div>
        )}
      </div>
    </div>
  );
};

export default InstitutionsList;