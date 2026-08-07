import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import Pagination from '../components/Pagination';
import '../styles/cards.css';

const ITEMS_PER_PAGE = 8;

const ResearchersList = () => {
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const filtered = researchers.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const fullName = r?.full_name || r?.user?.full_name || r?.user_full_name || '';
    return fullName.toLowerCase().includes(s) ||
      (r.department || '').toLowerCase().includes(s) ||
      (r.skills || '').toLowerCase().includes(s) ||
      (r.designation || '').toLowerCase().includes(s);
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="container py-5">
      <h2 className="mb-4"><i className="bi bi-people"></i> Researchers Directory</h2>

      <div className="mb-4">
        <input
          className="form-control"
          placeholder="Search by name, department, skills, or designation..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <p className="text-muted small mt-1">{filtered.length} researcher{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="row">
        {paginated.length > 0 ? (
          paginated.map((researcher) => {
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
          <div className="alert alert-info">No researchers found.</div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default ResearchersList;