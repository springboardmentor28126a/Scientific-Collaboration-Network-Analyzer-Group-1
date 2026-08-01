import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ChangePasswordPage from "../pages/ChangePasswordPage";

import SystemAdminDashboard from "../pages/dashboards/SystemAdminDashboard";
import InstitutionAdminDashboard from "../pages/dashboards/InstitutionAdminDashboard";
import ResearcherDashboard from "../pages/dashboards/ResearcherDashboard";
import ReviewerDashboard from "../pages/dashboards/ReviewerDashboard";

import InstitutionPage from "../pages/InstitutionPage";
import DepartmentPage from "../pages/DepartmentPage";
import ResearcherPage from "../pages/ResearcherPage";
import UserManagementPage from "../pages/UserManagementPage";
import BrowsePublicationsPage from "../pages/BrowsePublicationsPage";
import ConferencesPage from "../pages/ConferencesPage";
import CollaborationsPage from "../pages/CollaborationsPage";
import AnalyticsDashboardPage from "../pages/AnalyticsDashboardPage";
import ReportsPage from "../pages/ReportsPage";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Any authenticated user */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Role-based dashboards */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
              <SystemAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/institution-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["INSTITUTION_ADMIN"]}>
              <InstitutionAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/publications"
  element={
    <ProtectedRoute allowedRoles={["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "RESEARCHER", "REVIEWER"]}>
      <BrowsePublicationsPage />
    </ProtectedRoute>
  }
/>
        <Route
  path="/conferences"
  element={
    <ProtectedRoute allowedRoles={["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "RESEARCHER", "REVIEWER"]}>
      <ConferencesPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="/researcher/dashboard"
          element={
            <ProtectedRoute allowedRoles={["RESEARCHER"]}>
              <ResearcherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/analytics"
  element={
    <ProtectedRoute allowedRoles={["SYSTEM_ADMIN", "INSTITUTION_ADMIN"]}>
      <AnalyticsDashboardPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="/reviewer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["REVIEWER"]}>
              <ReviewerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shared management pages (role-checked inside ProtectedRoute) */}
        <Route
          path="/institutions"
          element={
            <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
              <InstitutionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={["SYSTEM_ADMIN", "INSTITUTION_ADMIN"]}>
              <DepartmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/researchers"
          element={
            <ProtectedRoute allowedRoles={["SYSTEM_ADMIN", "INSTITUTION_ADMIN"]}>
              <ResearcherPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
  path="/reports"
  element={
    <ProtectedRoute allowedRoles={["SYSTEM_ADMIN", "INSTITUTION_ADMIN"]}>
      <ReportsPage />
    </ProtectedRoute>
  }
/>
        <Route
  path="/collaborations"
  element={
    <ProtectedRoute allowedRoles={["RESEARCHER"]}>
      <CollaborationsPage />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;