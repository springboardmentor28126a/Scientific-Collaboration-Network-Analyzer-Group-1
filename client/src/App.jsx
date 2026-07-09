// import { BrowserRouter, Route, Routes } from "react-router-dom";

// import Dashboard from "./pages/Dashboard";
// import Login from "./pages/Login";
// import Publications from "./pages/Publications";
// import Register from "./pages/Register";
// import ResearcherProfile from "./pages/ResearcherProfile";
// import ForgotPassword from "./pages/ForgotPassword";
// import Profile from "./pages/Profile";
// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         <Route path="/" element={<Login />} />

//         <Route path="/register" element={<Register />} />

//         <Route path="/dashboard" element={<Dashboard />} />

//         <Route path="/profile" element={<ResearcherProfile />} />

//         {/* Publication Module */}
//         <Route path="/publications" element={<Publications />} />
// <Route
//     path="/forgot-password"
//     element={<ForgotPassword />}
// />
//       </Routes>
//       <Route

// path="/profile"

// element={<Profile />}

// />
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Publications from "./pages/Publications";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;