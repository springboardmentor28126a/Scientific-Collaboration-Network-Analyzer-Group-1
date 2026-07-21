import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Admin Dashboard</h3>
          <p className="text-muted mb-0">Manage platform users and their access roles.</p>
        </div>
        <Link to="/admin/users" className="btn btn-primary"><i className="bi bi-people" /> User Management</Link>
      </div>
      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <div>
          <h5>Users</h5>
          <ul className="list-group">
            {users.map((u) => (
              <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{u.full_name}</strong> — {u.email}
                  <div className="text-muted">Role: {u.role}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
