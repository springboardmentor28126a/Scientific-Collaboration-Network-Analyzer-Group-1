import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top navbar-gradient">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-graph"></i> <strong>Research Network</strong>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    <i className="bi bi-speedometer2"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    <i className="bi bi-person"></i> My Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/researchers">
                    <i className="bi bi-people"></i> Researchers
                  </Link>
                </li>
                
                <li className="nav-item">
  <Link className="nav-link" to="/institutions">
    <i className="bi bi-building"></i> Institutions
  </Link>
</li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle"></i> {user?.full_name || user?.email || 'User'}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a className="dropdown-item" href="#" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </a></li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
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