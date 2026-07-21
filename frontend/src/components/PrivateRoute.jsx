import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const normalizeRole = (role) => {
  if (!role) return '';
  if (typeof role === 'string') return role.toLowerCase();
  if (typeof role === 'object' && role?.value) return String(role.value).toLowerCase();
  return String(role).toLowerCase();
};

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const normalizedUserRole = normalizeRole(user?.role);
  const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default PrivateRoute;