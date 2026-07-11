import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import DashboardPage from "../pages/DashboardPage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import InstitutionPage from "../pages/InstitutionPage";
import DepartmentPage from "../pages/DepartmentPage";
import ResearcherPage from "../pages/ResearcherPage";
import UserManagementPage from "../pages/UserManagementPage";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route
    path="/users"
    element={<UserManagementPage />}
/>
        {/* Protected Routes */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/institutions"
          element={
            <ProtectedRoute>
              <InstitutionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <DepartmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/researchers"
          element={
            <ProtectedRoute>
              <ResearcherPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;