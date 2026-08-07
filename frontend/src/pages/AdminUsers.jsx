import React, { useEffect, useState } from 'react';
import api from '../config/api';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;
const roleLabel = (role) => (role || 'researcher').replaceAll('_', ' ');

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, institutionsRes] = await Promise.all([api.get('/admin/users'), api.get('/institutions/?limit=1000')]);
      setUsers(usersRes.data || []);
      setInstitutions(institutionsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const updateRole = async (id, role) => {
    try { await api.put(`/admin/users/${id}/role`, null, { params: { role } }); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed to update role'); }
  };
  const decideRequest = async (id, approved) => {
    try { await api.put(`/admin/users/${id}/role-request`, null, { params: { approved } }); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed to process role request'); }
  };
  const assignInstitution = async (id, institutionId) => {
    try { await api.put(`/admin/users/${id}/institution`, null, { params: { institution_id: institutionId || null } }); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed to assign institution'); }
  };
  const toggleActive = async (user) => {
    try { await api.put(`/admin/users/${user.id}/activate`, null, { params: { active: !user.is_active } }); fetchData(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed to update account status'); }
  };

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return u.full_name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.username?.toLowerCase().includes(s);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3>User access management</h3>
          <p className="text-muted mb-0">Approve requested roles and assign institution administrators.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={fetchData}>Refresh</button>
      </div>

      {/* Search and filter */}
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Search by name, email, or username..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <select className="form-select" style={{ maxWidth: '200px' }} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All roles</option>
          <option value="researcher">Researcher</option>
          <option value="institution_admin">Institution Admin</option>
          <option value="reviewer">Reviewer</option>
          <option value="system_admin">System Admin</option>
        </select>
      </div>

      <p className="text-muted small">{filtered.length} user{filtered.length !== 1 ? 's' : ''} found</p>

      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && (
        <>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr><th>User</th><th>Current role</th><th>Requested role</th><th>Institution assignment</th><th>Account</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginated.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.full_name}</strong><br /><small>{u.email}</small></td>
                    <td>
                      <select className="form-select form-select-sm" value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
                        <option value="researcher">Researcher</option>
                        <option value="institution_admin">Institution admin</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="system_admin">System admin</option>
                      </select>
                    </td>
                    <td>
                      {u.requested_role ? (
                        <>
                          <span className="badge bg-warning text-dark">{roleLabel(u.requested_role)} · {u.role_request_status || 'pending'}</span>
                          <div className="mt-1">
                            <button className="btn btn-sm btn-success me-1" onClick={() => decideRequest(u.id, true)}>Approve</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => decideRequest(u.id, false)}>Reject</button>
                          </div>
                        </>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      {u.role === 'institution_admin' ? (
                        <select className="form-select form-select-sm" value={u.assigned_institution_id || ''} onChange={(e) => assignInstitution(u.id, e.target.value)}>
                          <option value="">Unassigned</option>
                          {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      ) : <span className="text-muted">N/A</span>}
                    </td>
                    <td><span className={`badge ${u.is_active ? 'bg-success' : 'bg-secondary'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td><button className="btn btn-sm btn-outline-secondary" onClick={() => toggleActive(u)}>{u.is_active ? 'Deactivate' : 'Activate'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
};

export default AdminUsers;
