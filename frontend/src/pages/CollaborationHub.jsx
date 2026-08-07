import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const emptyProject = { title: '', description: '', start_date: '', end_date: '', status: 'planning' };

export default function CollaborationHub() {
  const { user } = useContext(AuthContext);
  const canManageProjects = ['researcher', 'system_admin'].includes(user?.role);
  
  const [tab, setTab] = useState('projects');
  
  const [projects, setProjects] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  
  const [form, setForm] = useState(emptyProject);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectPage, setProjectPage] = useState(1);
  
  const loadProjects = async () => {
    try {
      const res = await api.get('/collaborations/projects');
      setProjects(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load projects');
    }
  };

  const loadRequests = async () => {
    try {
      const inc = await api.get('/collaborations/incoming');
      setIncoming(inc.data);
      const snt = await api.get('/collaborations/sent');
      setSent(snt.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load requests');
    }
  };

  useEffect(() => {
    loadProjects();
    loadRequests();
  }, []);

  const saveProject = async e => {
    e.preventDefault();
    try {
      const data = { ...form, start_date: form.start_date || null, end_date: form.end_date || null };
      editing ? await api.put(`/collaborations/projects/${editing}`, data) : await api.post('/collaborations/projects', data);
      setForm(emptyProject);
      setEditing(null);
      loadProjects();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to save project');
    }
  };

  const handleRequest = async (id, action) => {
    try {
      await api.patch(`/collaborations/${id}/${action}`);
      loadRequests();
    } catch (e) {
      setError(e.response?.data?.detail || `Unable to ${action} request`);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-diagram-3"></i> Collaboration Hub</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>Projects</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'incoming' ? 'active' : ''}`} onClick={() => setTab('incoming')}>
            Incoming Requests {incoming.filter(r => r.status === 'pending').length > 0 && <span className="badge bg-danger ms-1">{incoming.filter(r => r.status === 'pending').length}</span>}
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>Sent Requests</button>
        </li>
      </ul>

      {tab === 'projects' && (
        <div className="row">
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <strong>My Projects</strong>
              </div>
              <div className="p-3">
                <input className="form-control" placeholder="Search projects..." value={projectSearch} onChange={(e) => { setProjectSearch(e.target.value); setProjectPage(1); }} />
              </div>
              <div className="list-group list-group-flush">
                {(() => {
                  const filteredProjects = projects.filter((p) => !projectSearch || p.title?.toLowerCase().includes(projectSearch.toLowerCase()));
                  const perPage = 5;
                  const totalPages = Math.ceil(filteredProjects.length / perPage);
                  const paginatedProjects = filteredProjects.slice((projectPage - 1) * perPage, projectPage * perPage);
                  return (
                    <>
                      {paginatedProjects.length ? paginatedProjects.map((p) => (
                  <div className="list-group-item" key={p.id}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong><Link to={`/collaborations/projects/${p.id}`} className="text-decoration-none">{p.title}</Link></strong>
                        <div className="small text-muted">{p.status.replace('_', ' ')} · {p.member_count} members</div>
                        <div>{p.description}</div>
                      </div>
                      <div>
                        <Link to={`/collaborations/projects/${p.id}`} className="btn btn-sm btn-outline-primary me-1">View</Link>
                        {user.id === p.created_by && (
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => { setEditing(p.id); setForm({ title: p.title, description: p.description || '', start_date: p.start_date || '', end_date: p.end_date || '', status: p.status }); }}>Edit</button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : <div className="list-group-item text-muted">No projects match your search.</div>}
                      <div className="p-2">
                        <Pagination currentPage={projectPage} totalPages={totalPages} onPageChange={setProjectPage} />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            {canManageProjects ? (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5>{editing ? 'Edit Project' : 'Create Project'}</h5>
                  <form onSubmit={saveProject}>
                    <input className="form-control mb-2" placeholder="Project title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
                    <textarea className="form-control mb-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
                    <div className="row">
                      <div className="col"><input type="date" className="form-control mb-2" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})}/></div>
                      <div className="col"><input type="date" className="form-control mb-2" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})}/></div>
                    </div>
                    <select className="form-select mb-3" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On hold</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button className="btn btn-primary">{editing ? 'Save changes' : 'Create project'}</button>
                    {editing && <button type="button" className="btn btn-link" onClick={()=>{setEditing(null);setForm(emptyProject)}}>Cancel</button>}
                  </form>
                </div>
              </div>
            ) : <div className="alert alert-info">You can view collaboration information for your institution.</div>}
          </div>
        </div>
      )}

      {tab === 'incoming' && (
        <div className="card shadow-sm">
          <div className="list-group list-group-flush">
            {incoming.length ? incoming.map(r => (
              <div key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{r.sender_name}</strong> invited you to collaborate 
                  {r.project_title ? <span> on project <strong>{r.project_title}</strong></span> : <span> (Type: {r.collaboration_type})</span>}
                  <div className="small text-muted">{new Date(r.created_at).toLocaleString()}</div>
                  {r.message && <div className="mt-1 text-muted fst-italic">"{r.message}"</div>}
                </div>
                <div>
                  {r.status === 'pending' ? (
                    <>
                      <button className="btn btn-sm btn-success me-1" onClick={() => handleRequest(r.id, 'accept')}>Accept</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleRequest(r.id, 'reject')}>Reject</button>
                    </>
                  ) : (
                    <span className={`badge ${r.status === 'accepted' ? 'bg-success' : 'bg-secondary'}`}>{r.status}</span>
                  )}
                </div>
              </div>
            )) : <div className="list-group-item text-muted">No incoming requests.</div>}
          </div>
        </div>
      )}

      {tab === 'sent' && (
        <div className="card shadow-sm">
          <div className="list-group list-group-flush">
            {sent.length ? sent.map(r => (
              <div key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  You invited <strong>{r.receiver_name}</strong> to collaborate 
                  {r.project_title ? <span> on project <strong>{r.project_title}</strong></span> : <span> (Type: {r.collaboration_type})</span>}
                  <div className="small text-muted">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div>
                  {r.status === 'pending' ? (
                    <button className="btn btn-sm btn-outline-warning" onClick={() => handleRequest(r.id, 'cancel')}>Cancel Request</button>
                  ) : (
                    <span className={`badge ${r.status === 'accepted' ? 'bg-success' : 'bg-secondary'}`}>{r.status}</span>
                  )}
                </div>
              </div>
            )) : <div className="list-group-item text-muted">No sent requests.</div>}
          </div>
        </div>
      )}

    </div>
  );
}
