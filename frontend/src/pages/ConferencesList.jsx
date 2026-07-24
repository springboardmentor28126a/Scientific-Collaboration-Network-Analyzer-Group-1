import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';

const ConferencesList = () => {
  const [conferences, setConferences] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const role = user?.role;
  const canRegister = role === 'researcher' || role === 'system_admin';
  const canManage = role === 'institution_admin' || role === 'system_admin';
  const load = async () => { try {
    const requests = [api.get('/conferences/')]; if (canRegister) requests.push(api.get('/conferences/registrations/me'));
    const results = await Promise.all(requests); setConferences(results[0].data); setRegistrations(results[1]?.data || []);
  } catch (err) { alert(err.response?.data?.detail || 'Failed to load conferences'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const registrationFor = (id) => registrations.find((r) => r.conference_id === id);
  const register = async (id) => { try { await api.post(`/conferences/${id}/register`, { presentation_title: null, presentation_abstract: null }); await load(); } catch (e) { alert(e.response?.data?.detail || 'Registration failed'); } };
  const unregister = async (id) => { if (!window.confirm('Cancel this registration?')) return; try { await api.delete(`/conferences/${id}/register`); await load(); } catch (e) { alert(e.response?.data?.detail || 'Unable to cancel registration'); } };
  const presentation = async (id, existing) => { const title = window.prompt('Presentation title', existing?.presentation_title || ''); if (title === null) return; const abstract = window.prompt('Presentation abstract', existing?.presentation_abstract || ''); if (abstract === null) return; try { await api.put(`/conferences/${id}/registration`, { presentation_title: title, presentation_abstract: abstract }); await load(); } catch (e) { alert(e.response?.data?.detail || 'Unable to save presentation details'); } };
  const participants = async (id) => { try { const { data } = await api.get(`/conferences/${id}/participants`); alert(data.length ? data.map((p) => `User #${p.user_id}${p.presentation_title ? ` — ${p.presentation_title}` : ''}`).join('\n') : 'No participants yet.'); } catch (e) { alert(e.response?.data?.detail || 'Unable to load participants'); } };
  if (loading) return <div className="container mt-5"><div className="spinner-border" /></div>;
  return <div className="container mt-5"><div className="d-flex justify-content-between align-items-center mb-4"><div><h2>Conferences</h2>{canRegister && <small className="text-muted">Your registrations: {registrations.length}</small>}</div>{canManage && <Link to="/conferences/create" className="btn btn-primary"><i className="bi bi-plus-circle"></i> New Conference</Link>}</div>
    <div className="row">{conferences.length === 0 ? <p>No conferences found.</p> : conferences.map((conf) => { const registration = registrationFor(conf.id); return <div key={conf.id} className="col-md-6 mb-4"><div className="card h-100 shadow-sm border-0"><div className="card-body"><h5 className="card-title text-primary">{conf.name}</h5><h6 className="card-subtitle mb-2 text-muted">{conf.location} • {conf.date}</h6><p className="card-text">{conf.description}</p></div><div className="card-footer bg-white d-flex justify-content-between align-items-center"><span className="badge bg-secondary">{conf.status}</span><div>{canManage && <button onClick={() => participants(conf.id)} className="btn btn-sm btn-outline-secondary me-1">Participants</button>}{canRegister && !registration && <button onClick={() => register(conf.id)} className="btn btn-sm btn-outline-primary">Register</button>}{canRegister && registration && <><button onClick={() => presentation(conf.id, registration)} className="btn btn-sm btn-outline-primary me-1">Presentation</button><button onClick={() => unregister(conf.id)} className="btn btn-sm btn-outline-danger">Unregister</button></>}</div></div></div></div>; })}</div>
  </div>;
};
export default ConferencesList;
