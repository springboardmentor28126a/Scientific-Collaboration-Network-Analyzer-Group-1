import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Publications from "./pages/Publications";
import Projects from "./pages/Projects";
import Conferences from "./pages/Conferences";
import Collaborations from "./pages/Collaborations";
import Citations from "./pages/Citations";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Institutions from "./pages/Institutions";
import Researchers from "./pages/Researchers";
import Departments from "./pages/Departments";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* =====================================================
              PUBLIC ROUTES
              ===================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/"
            element={<Login />}
          />


          {/* =====================================================
              PROTECTED ROUTES
              ===================================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/publications"
            element={
              <ProtectedRoute>
                <Publications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/conferences"
            element={
              <ProtectedRoute>
                <Conferences />
              </ProtectedRoute>
            }
          />

          <Route
            path="/collaborations"
            element={
              <ProtectedRoute>
                <Collaborations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/citations"
            element={
              <ProtectedRoute>
                <Citations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/institutions"
            element={
              <ProtectedRoute>
                <Institutions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/researchers"
            element={
              <ProtectedRoute>
                <Researchers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <Audit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <Departments />
              </ProtectedRoute>
            }
          />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;