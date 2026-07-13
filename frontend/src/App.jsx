import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfileView from './pages/ProfileView';
import ProfileCreate from './pages/ProfileCreate';
import ProfileEdit from './pages/ProfileEdit';
import ResearchersList from './pages/ResearchersList';
import ResearcherDetail from './pages/ResearcherDetail';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileView />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/create"
            element={
              <PrivateRoute>
                <ProfileCreate />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <PrivateRoute>
                <ProfileEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/institutions"
            element={
              <PrivateRoute>
                <Navigate to="/dashboard" replace />
              </PrivateRoute>
            }
          />
          <Route
            path="/institutions/:id"
            element={
              <PrivateRoute>
                <Navigate to="/dashboard" replace />
              </PrivateRoute>
            }
          />
          <Route
            path="/institutions/create"
            element={
              <PrivateRoute>
                <Navigate to="/dashboard" replace />
              </PrivateRoute>
            }
          />
          <Route
            path="/researchers"
            element={
              <PrivateRoute>
                <ResearchersList />
              </PrivateRoute>
            }
          />
          <Route
            path="/researchers/:id"
            element={
              <PrivateRoute>
                <ResearcherDetail />
              </PrivateRoute>
            }
          />

          <Route
            path="/access-denied"
            element={
              <div className="container py-5">
                <div className="alert alert-warning">
                  <h4>Access denied</h4>
                  <p>This page is available only for researcher accounts.</p>
                </div>
              </div>
            }
          />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;