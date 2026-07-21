import React, { useContext } from 'react';
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
import InstitutionsList from './pages/InstitutionsList';
import InstitutionDetail from './pages/InstitutionDetail';
import InstitutionCreate from './pages/InstitutionCreate';
import PublicationsList from './pages/PublicationsList';
import PublicationCreate from './pages/PublicationCreate';
import ConferencesList from './pages/ConferencesList';
import ConferenceCreate from './pages/ConferenceCreate';
import ReviewQueue from './pages/ReviewQueue';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import './App.css';

import { AuthContext } from './context/AuthContext';

const HomeRedirect = () => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null;
  return token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['researcher', 'institution_admin', 'reviewer', 'system_admin']}>
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
  path="/institutions"
  element={
    <PrivateRoute>
      <InstitutionsList />
    </PrivateRoute>
  }
/>
<Route
  path="/institutions/:id"
  element={
    <PrivateRoute>
      <InstitutionDetail />
    </PrivateRoute>
  }
/>
 
          <Route
            path="/institutions/create"
            element={
              <PrivateRoute allowedRoles={['institution_admin', 'system_admin']}>
                <InstitutionCreate />
              </PrivateRoute>
            }
          />
          <Route
            path="/publications"
            element={
              <PrivateRoute allowedRoles={['researcher', 'institution_admin', 'reviewer', 'system_admin']}>
                <PublicationsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/publications/create"
            element={
              <PrivateRoute allowedRoles={['researcher', 'system_admin']}>
                <PublicationCreate />
              </PrivateRoute>
            }
          />
          <Route
            path="/conferences"
            element={
              <PrivateRoute allowedRoles={['researcher', 'institution_admin', 'reviewer', 'system_admin']}>
                <ConferencesList />
              </PrivateRoute>
            }
          />
          <Route
            path="/review-queue"
            element={
              <PrivateRoute allowedRoles={['reviewer', 'system_admin']}>
                <ReviewQueue />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['system_admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={['system_admin']}>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/conferences/create"
            element={
              <PrivateRoute allowedRoles={['institution_admin', 'system_admin']}>
                <ConferenceCreate />
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
