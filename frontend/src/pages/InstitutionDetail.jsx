import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../config/api';

const InstitutionDetail = () => {
  const { id } = useParams();
  const [institution, setInstitution] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/institutions/${id}`)
      .then((response) => setInstitution(response.data))
      .catch((err) => setError(err.response?.data?.detail || 'Institution not found'));
  }, [id]);

  if (error) return <div className="container py-5"><div className="alert alert-danger">{error} <Link to="/institutions">Back to institutions</Link></div></div>;
  if (!institution) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div className="container py-5">
      <div className="row"><div className="col-md-8">
        <div className="card shadow-sm"><div className="card-body">
          <h2><i className="bi bi-building" /> {institution.name}</h2>
          <hr />
          <h5>About</h5>
          <p>{institution.description || 'No description has been added.'}</p>
          <h5>Location</h5>
          <p><i className="bi bi-geo-alt" /> {institution.city}, {institution.country}</p>
          {institution.website && <a className="btn btn-outline-primary me-2" href={institution.website} target="_blank" rel="noreferrer"><i className="bi bi-globe" /> Visit website</a>}
          <Link to="/institutions" className="btn btn-secondary"><i className="bi bi-arrow-left" /> Back to Institutions</Link>
        </div></div>
      </div></div>
    </div>
  );
};

export default InstitutionDetail;
