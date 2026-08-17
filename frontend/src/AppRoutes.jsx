import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Researchers from "./pages/Researchers";
import Publications from "./pages/Publications";
import Conferences from "./pages/Conferences";
import Institutions from "./pages/Institutions";
import CollaborationGraph from "./pages/CollaborationGraph";
import Projects from "./pages/Projects";
import Teams from "./pages/Teams";
import ProjectAssignments from "./pages/ProjectAssignments";
import InstitutionCollaborations from "./pages/InstitutionCollaborations";
import Citations from "./pages/Citations";
import References from "./pages/References";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import InstitutionAdminDashboard from "./pages/InstitutionAdminDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import SystemAdminDashboard from "./pages/SystemAdminDashboard";
function RoleDashboard() {
  const role = localStorage.getItem("role");

  switch (role) {
    case "researcher":
      return <ResearcherDashboard />;

    case "institution_admin":
      return <InstitutionAdminDashboard />;

    case "reviewer":
      return <ReviewerDashboard />;

    case "system_admin":
      return <SystemAdminDashboard />;

    default:
      return <Login />;
  }
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<RoleDashboard />} />
        <Route path="/researchers" element={<Researchers />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/conferences" element={<Conferences />} />
        <Route path="/institutions" element={<Institutions />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/citations" element={<Citations />} />
        <Route
    path="/institution-collaborations"
    element={<InstitutionCollaborations />}
/>
        <Route
    path="/collaboration-graph"
    element={<CollaborationGraph />}
/>
<Route
    path="/project-assignments"
    element={<ProjectAssignments />}
/>
<Route path="/references" element={<References />} />
<Route path="/reports" element={<Reports />} />
<Route path="/audit" element={<Audit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;