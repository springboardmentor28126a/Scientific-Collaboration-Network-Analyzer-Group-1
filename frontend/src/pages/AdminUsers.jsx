import React, { useEffect, useState } from 'react';
import api from '../config/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [usersResponse, institutionsResponse] = await Promise.all([api.get('/admin/users'), api.get('/institutions/?limit=1000')]);
      setUsers(usersResponse.data || []);
      setInstitutions(institutionsResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const updateRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, null, { params: { role } });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update role');
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}/activate`, null, { params: { active: !user.is_active } });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update account status');
    }
  };

  const decideRequest = async (id, approved) => {
    try {
      await api.put(`/admin/users/${id}/role-request`, null, { params: { approved } });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update role request');
    }
  };

  const assignInstitution = async (id, institutionId) => {
    try {
      await api.put(`/admin/users/${id}/institution`, null, { params: { institution_id: institutionId || null } });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign institution');
    }
  };

  return (
    <div className="container py-4">
      <h3>Admin — Users</h3>
      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5>Create user</h5>
          <form onSubmit={handleCreate} className="row g-2">
            <div className="col-md-3">
              <input className="form-control" name="full_name" placeholder="Full name" value={form.full_name} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <input className="form-control" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
            </div>
            <div className="col-md-3">
              <input className="form-control" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <input className="form-control" type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                <option value="researcher">researcher</option>
                <option value="institution_admin">institution_admin</option>
                <option value="reviewer">reviewer</option>
                <option value="system_admin">system_admin</option>
              </select>
            </div>
            <div className="col-12 mt-2">
              <button className="btn btn-primary">Create user</button>
            </div>
          </form>
        </div>
      </div>

      <div>
        <h5>Existing users</h5>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>
                  <select className="form-select form-select-sm" value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
                    <option value="researcher">Researcher</option>
                    <option value="institution_admin">Institution Admin</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="system_admin">System Admin</option>
                  </select>
                </td>
                <td><span className={`badge ${u.is_active ? 'bg-success' : 'bg-secondary'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => toggleActive(u)}>{u.is_active ? 'Deactivate' : 'Activate'}</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
