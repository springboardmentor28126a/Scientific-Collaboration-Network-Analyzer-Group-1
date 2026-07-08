import { BrowserRouter, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Publications from "./pages/Publications";
import Register from "./pages/Register";
import ResearcherProfile from "./pages/ResearcherProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<ResearcherProfile />} />

        {/* Publication Module */}
        <Route path="/publications" element={<Publications />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;