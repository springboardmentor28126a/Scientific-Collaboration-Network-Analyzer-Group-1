import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import '../styles/institution-detail.css';
import { AuthContext } from '../context/AuthContext';

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
  const { id } = useParams(); const { user } = useContext(AuthContext); const [institution, setInstitution] = useState(null); const [loading, setLoading] = useState(true); const [editing, setEditing] = useState(false); const navigate = useNavigate();
  useEffect(() => { api.get(`/institutions/${id}/overview`).then((response) => setInstitution(response.data)).catch(() => { alert('Institution not found'); navigate('/institutions'); }).finally(() => setLoading(false)); }, [id, navigate]);
  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  // Institution-admin lists are already scoped by the API; the API repeats the
  // ownership check on update, so this control never grants cross-institution access.
  const canEdit = user?.role === 'system_admin' || user?.role === 'institution_admin';
  const save = async (e) => { e.preventDefault(); try { const { data } = await api.put(`/institutions/${id}`, { name: institution.name, description: institution.description, country: institution.country, city: institution.city, website: institution.website }); setInstitution({ ...institution, ...data }); setEditing(false); } catch (err) { alert(err.response?.data?.detail || 'Unable to update institution'); } };
  return <div className="container py-5"><div className="card mb-4"><div className="card-body"><div className="d-flex justify-content-between"><h2><i className="bi bi-building"></i> {institution.name}</h2>{canEdit && <button className="btn btn-outline-primary btn-sm" onClick={()=>setEditing(true)}>Edit institution</button>}</div><p>{institution.description || 'No description available'}</p><p className="mb-1"><i className="bi bi-geo-alt"></i> {institution.city}, {institution.country}</p>{institution.website && <a href={institution.website} target="_blank" rel="noopener noreferrer"><i className="bi bi-globe"></i> Visit institution website</a>}</div></div>
    <div className="row mb-4">{[['Publications', institution.publications_count, 'bi-journal-text'], ['Researchers', institution.researchers_count, 'bi-people'], ['Reviewers', institution.reviewers_count, 'bi-clipboard-check'], ['Institution admins', institution.administrators_count, 'bi-person-gear']].map(([label, value, icon]) => <div className="col-md-3 mb-3" key={label}><div className="card text-center"><div className="card-body"><i className={`bi ${icon} fs-3 text-primary`}></i><h3 className="mb-0">{value}</h3><span className="text-muted">{label}</span></div></div></div>)}</div>
    <div className="institution-members-heading"><div><span className="section-kicker">Community</span><h3>People at this institution</h3><p>Browse the academic team by their platform role.</p></div></div>
    <div className="row g-4"><div className="col-lg-4"><PeopleList title="Researchers" people={institution.researchers} empty="No researchers added yet." /></div><div className="col-lg-4"><PeopleList title="Reviewers" people={institution.reviewers} empty="No affiliated reviewers yet." /></div><div className="col-lg-4"><PeopleList title="Institution administrators" people={institution.administrators} empty="No administrator assigned yet." /></div></div>
    <Link to="/institutions" className="btn btn-secondary mt-4"><i className="bi bi-arrow-left"></i> Back to Institutions</Link>
    {editing && <div className="modal d-block" style={{background:'rgba(0,0,0,.4)'}}><div className="modal-dialog"><form className="modal-content" onSubmit={save}><div className="modal-header"><h5>Edit institution</h5><button type="button" className="btn-close" onClick={()=>setEditing(false)}/></div><div className="modal-body"><input className="form-control mb-2" value={institution.name} onChange={e=>setInstitution({...institution,name:e.target.value})} required/><textarea className="form-control mb-2" value={institution.description || ''} onChange={e=>setInstitution({...institution,description:e.target.value})}/><input className="form-control mb-2" value={institution.country} onChange={e=>setInstitution({...institution,country:e.target.value})} required/><input className="form-control mb-2" value={institution.city} onChange={e=>setInstitution({...institution,city:e.target.value})} required/><input className="form-control" value={institution.website || ''} onChange={e=>setInstitution({...institution,website:e.target.value})}/></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={()=>setEditing(false)}>Cancel</button><button className="btn btn-primary">Save changes</button></div></form></div></div>}
  </div>;
};
export default InstitutionDetail;
