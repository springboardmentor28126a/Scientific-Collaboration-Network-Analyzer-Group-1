import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 6;

export default function PublicationsList() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const { user } = useContext(AuthContext);

  const load = async () => {
    try {
      setPublications((await api.get('/publications/')).data);
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const owns = (p) => p.created_by_id === user?.id || user?.role === 'system_admin';

  const remove = async (id) => {
    if (window.confirm('Delete this publication?'))
      try { await api.delete(`/publications/${id}`); load(); }
      catch (e) { alert(e.response?.data?.detail || 'Unable to delete publication'); }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: editing.title,
        abstract: editing.abstract,
        publication_type: editing.publication_type,
        status: editing.status,
        published_date: editing.published_date ? new Date(editing.published_date).toISOString() : null
      };
      await api.put(`/publications/${editing.id}`, payload);
      setEditing(null);
      load();
    } catch (e) {
      alert(e.response?.data?.detail || 'Unable to update publication');
    }
  };

  const viewFile = async (p) => {
    try {
      const r = await api.get(p.file_path, { responseType: 'blob' });
      window.open(URL.createObjectURL(r.data), '_blank', 'noopener,noreferrer');
    } catch (e) {
      alert(e.response?.data?.detail || 'Unable to open this file');
    }
  };

  if (loading) return <div className="container mt-5"><div className="spinner-border" /></div>;

  const filtered = publications.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (typeFilter && p.publication_type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!p.title?.toLowerCase().includes(s) && !p.abstract?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setCurrentPage(1); };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Publications</h2>
        {['researcher', 'system_admin'].includes(user?.role) && (
          <Link to="/publications/create" className="btn btn-primary">New Publication</Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Search publications..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <select className="form-select" style={{ maxWidth: '180px' }} value={statusFilter} onChange={handleFilterChange(setStatusFilter)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="published">Published</option>
        </select>
        <select className="form-select" style={{ maxWidth: '180px' }} value={typeFilter} onChange={handleFilterChange(setTypeFilter)}>
          <option value="">All types</option>
          <option value="journal">Journal</option>
          <option value="conference">Conference</option>
          <option value="book">Book</option>
        </select>
      </div>

      <p className="text-muted small">{filtered.length} publication{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Publications Grid */}
      <div className="row">
        {paginated.map((p) => (
          <div key={p.id} className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="text-primary">{p.title}</h5>
                <div className="text-muted mb-2">{p.publication_type} · {p.status} · {p.citation_count || 0} citations</div>
                <p>{p.abstract?.substring(0, 150)}...</p>
                {p.file_path && (
                  <button onClick={() => viewFile(p)} className="btn btn-sm btn-outline-secondary me-2">View PDF</button>
                )}
                <Link to={`/publications/${p.id}`} className="btn btn-sm btn-outline-info me-2">View Details</Link>
                {owns(p) && (
                  <>
                    <button className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => setEditing({ ...p, published_date: p.published_date ? p.published_date.slice(0, 10) : '' })}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p.id)}>Delete</button>
                  </>
                )}
              </div>
              <div className="card-footer small text-muted">
                Published: {p.published_date ? new Date(p.published_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        ))}
        {!filtered.length && <p>No publications found.</p>}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Edit Modal */}
      {editing && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={save}>
              <div className="modal-header">
                <h5>Edit publication</h5>
                <button type="button" className="btn-close" onClick={() => setEditing(null)} />
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
                <textarea className="form-control mb-2" rows="5" value={editing.abstract} onChange={(e) => setEditing({ ...editing, abstract: e.target.value })} required />
                <select className="form-select mb-2" value={editing.publication_type} onChange={(e) => setEditing({ ...editing, publication_type: e.target.value })}>
                  <option value="journal">Journal</option>
                  <option value="conference">Conference</option>
                  <option value="book">Book</option>
                </select>
                <select className="form-select mb-2" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="published">Published</option>
                </select>
                <input type="date" className="form-control" value={editing.published_date || ''} onChange={(e) => setEditing({ ...editing, published_date: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                <button className="btn btn-primary">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
