import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../config/api';

const InstitutionDetail = () => {
  const { id } = useParams();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstitution();
  }, [id]);

  const fetchInstitution = async () => {
    try {
      const response = await api.get(`/institutions/${id}`);
      setInstitution(response.data);
    } catch (err) {
      alert('Institution not found');
      navigate('/institutions');
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
              <h2><i className="bi bi-building"></i> {institution.name}</h2>
              <hr />
              <p><strong>Description:</strong></p>
              <p>{institution.description || 'No description available'}</p>

              <p><strong><i className="bi bi-geo-alt"></i> Location:</strong></p>
              <p>{institution.city}, {institution.country}</p>

              {institution.website && (
                <>
                  <p><strong><i className="bi bi-globe"></i> Website:</strong></p>
                  <p><a href={institution.website} target="_blank" rel="noopener noreferrer">{institution.website}</a></p>
                </>
              )}

              <div className="mt-4">
                <Link to="/institutions" className="btn btn-secondary">
                  <i className="bi bi-arrow-left"></i> Back to Institutions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDetail;