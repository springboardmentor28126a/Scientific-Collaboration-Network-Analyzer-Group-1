import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { WebSocketContext } from '../context/WebSocketContext';
import './Navbar.css';

const normalizeRole = (role) => {
  if (!role) return '';
  if (typeof role === 'string') return role.toLowerCase();
  if (typeof role === 'object' && role?.value) return String(role.value).toLowerCase();
  return String(role).toLowerCase();
};

const canAccess = (userRole, allowedRoles = []) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return Boolean(userRole);
  }
  if (!userRole) return false;
  const normalized = normalizeRole(userRole);
  return allowedRoles.map((r) => normalizeRole(r)).includes(normalized);
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(WebSocketContext) || { unreadCount: 0 };
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    setExpanded(false);
    navigate('/login');
  };

  const closeMenu = () => setExpanded(false);

  const role = user ? normalizeRole(user.role) : null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top navbar-gradient">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" onClick={closeMenu}>
          <i className="bi bi-graph"></i> <strong>SCNA</strong>
        </Link>
        <button className="navbar-toggler" type="button" onClick={() => setExpanded((value) => !value)} aria-controls="navbarNav" aria-expanded={expanded} aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`navbar-collapse ${expanded ? 'is-open' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto d-flex flex-row align-items-center flex-wrap">
            {user ? (
              <>
                {canAccess(role, ['researcher', 'institution_admin', 'reviewer', 'system_admin']) && (
                  <li className="nav-item mx-1">
                    <Link className="nav-link" to="/dashboard" onClick={closeMenu}>
                      <i className="bi bi-speedometer2"></i> Dashboard
                    </Link>
                  </li>
                )}

                {canAccess(role, ['researcher', 'institution_admin', 'reviewer', 'system_admin']) && (
                  <li className="nav-item mx-1"><Link className="nav-link" to="/collaborations" onClick={closeMenu}><i className="bi bi-diagram-3"></i> Collaborations</Link></li>
                )}

                {canAccess(role, ['researcher', 'institution_admin', 'reviewer', 'system_admin']) && (
                  <li className="nav-item mx-1"><Link className="nav-link" to="/notifications" onClick={closeMenu}>
                    <i className="bi bi-bell"></i> Notifications
                    {unreadCount > 0 && <span className="badge bg-danger rounded-pill ms-1">{unreadCount}</span>}
                  </Link></li>
                )}

                {canAccess(role, ['researcher', 'reviewer', 'system_admin']) && (
                  <li className="nav-item mx-1"><Link className="nav-link" to="/citations" onClick={closeMenu}><i className="bi bi-quote"></i> Citations</Link></li>
                )}

                <li className="nav-item mx-1">
                  <Link className="nav-link" to="/profile" onClick={closeMenu}>
                    <i className="bi bi-person"></i> My Profile
                  </Link>
                </li>

                {canAccess(role) && (
                  <li className="nav-item mx-1">
                    <Link className="nav-link" to="/researchers" onClick={closeMenu}>
                      <i className="bi bi-people"></i> Researchers
                    </Link>
                  </li>
                )}

                {canAccess(role) && (
                  <li className="nav-item mx-1">
                    <Link className="nav-link" to="/institutions" onClick={closeMenu}>
                      <i className="bi bi-building"></i> Institutions
                    </Link>
                  </li>
                )}

                {canAccess(role, ['researcher', 'institution_admin', 'reviewer', 'system_admin']) && (
                  <li className="nav-item mx-1">
                    <Link className="nav-link" to="/publications" onClick={closeMenu}>
                      <i className="bi bi-journal-text"></i> Publications
                    </Link>
                  </li>
                )}

                {canAccess(role, ['researcher', 'institution_admin', 'reviewer', 'system_admin']) && (
                  <li className="nav-item mx-1">
                    <Link className="nav-link" to="/conferences" onClick={closeMenu}>
                      <i className="bi bi-calendar-event"></i> Conferences
                    </Link>
                  </li>
                )}

                {canAccess(role, ['reviewer', 'system_admin']) && (
                  <li className="nav-item mx-1">
                    <Link className="nav-link" to="/review-queue" onClick={closeMenu}>
                      <i className="bi bi-list-check"></i> Review Queue
                    </Link>
                  </li>
                )}

                {canAccess(role, ['system_admin']) && (
                  <li className="nav-item mx-1">
                    <Link className="nav-link" to="/admin" onClick={closeMenu}>
                      <i className="bi bi-shield-lock"></i> Admin Dashboard
                    </Link>
                  </li>
                )}

                {canAccess(role, ['system_admin']) && (
                  <li className="nav-item mx-1">
                    <Link className="nav-link" to="/admin/users" onClick={closeMenu}>
                      <i className="bi bi-people"></i> User Management
                    </Link>
                  </li>
                )}

                <li className="nav-item mx-1">
                  <button className="nav-link logout-button" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item mx-1">
                  <Link className="nav-link" to="/login" onClick={closeMenu}>Login</Link>
                </li>
                <li className="nav-item mx-1">
                  <Link className="nav-link" to="/register" onClick={closeMenu}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
