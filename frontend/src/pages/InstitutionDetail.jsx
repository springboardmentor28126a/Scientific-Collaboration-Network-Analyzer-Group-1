import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import '../styles/institution-detail.css';

const roleStyles = {
  Researchers: { icon: 'bi-person-workspace', className: 'researcher' },
  Reviewers: { icon: 'bi-clipboard-check', className: 'reviewer' },
  'Institution administrators': { icon: 'bi-person-gear', className: 'admin' },
};

const PeopleList = ({ title, people, empty }) => {
  const role = roleStyles[title];
  return <section className={`member-panel ${role.className}`}>
    <header className="member-panel-header"><span className="member-role-icon"><i className={`bi ${role.icon}`}></i></span><div><h5>{title}</h5><p>{people?.length || 0} affiliated</p></div></header>
    {people?.length ? <div className="member-list">{people.map((person, index) => <div className="member-row" key={`${person.email}-${index}`}>
      <div className="member-avatar">{person.name?.trim()?.charAt(0)?.toUpperCase() || '?'}</div><div className="member-info">{person.id ? <Link to={`/researchers/${person.id}`}>{person.name}</Link> : <strong>{person.name}</strong>}<small>{person.designation || person.email}</small></div>{person.id && <Link className="member-link" to={`/researchers/${person.id}`} aria-label={`View ${person.name}`}><i className="bi bi-arrow-up-right"></i></Link>}
    </div>)}</div> : <div className="member-empty"><i className="bi bi-person-plus"></i><span>{empty}</span></div>}
  </section>;
};

const InstitutionDetail = () => {
  const { id } = useParams(); const [institution, setInstitution] = useState(null); const [loading, setLoading] = useState(true); const navigate = useNavigate();
  useEffect(() => { api.get(`/institutions/${id}/overview`).then((response) => setInstitution(response.data)).catch(() => { alert('Institution not found'); navigate('/institutions'); }).finally(() => setLoading(false)); }, [id, navigate]);
  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  return <div className="container py-5"><div className="card mb-4"><div className="card-body"><h2><i className="bi bi-building"></i> {institution.name}</h2><p>{institution.description || 'No description available'}</p><p className="mb-1"><i className="bi bi-geo-alt"></i> {institution.city}, {institution.country}</p>{institution.website && <a href={institution.website} target="_blank" rel="noopener noreferrer"><i className="bi bi-globe"></i> Visit institution website</a>}</div></div>
    <div className="row mb-4">{[['Publications', institution.publications_count, 'bi-journal-text'], ['Researchers', institution.researchers_count, 'bi-people'], ['Reviewers', institution.reviewers_count, 'bi-clipboard-check'], ['Institution admins', institution.administrators_count, 'bi-person-gear']].map(([label, value, icon]) => <div className="col-md-3 mb-3" key={label}><div className="card text-center"><div className="card-body"><i className={`bi ${icon} fs-3 text-primary`}></i><h3 className="mb-0">{value}</h3><span className="text-muted">{label}</span></div></div></div>)}</div>
    <div className="institution-members-heading"><div><span className="section-kicker">Community</span><h3>People at this institution</h3><p>Browse the academic team by their platform role.</p></div></div>
    <div className="row g-4"><div className="col-lg-4"><PeopleList title="Researchers" people={institution.researchers} empty="No researchers added yet." /></div><div className="col-lg-4"><PeopleList title="Reviewers" people={institution.reviewers} empty="No affiliated reviewers yet." /></div><div className="col-lg-4"><PeopleList title="Institution administrators" people={institution.administrators} empty="No administrator assigned yet." /></div></div>
    <Link to="/institutions" className="btn btn-secondary mt-4"><i className="bi bi-arrow-left"></i> Back to Institutions</Link>
  </div>;
};
export default InstitutionDetail;
