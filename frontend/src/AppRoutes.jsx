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

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/researchers" element={<Researchers />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/conferences" element={<Conferences />} />
        <Route path="/institutions" element={<Institutions />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/teams" element={<Teams />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;