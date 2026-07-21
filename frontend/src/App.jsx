import "./App.css";

import Navbar from "./components/Navbar";
import UserRoles from "./components/UserRoles";
import NetworkGraph from "./components/NetworkGraph";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Researchers from "./pages/Researchers";
import Institutions from "./pages/Institutions";
import Reviewers from "./pages/Reviewers";
import Admin from "./pages/Admin";

import Login from "./Login";
import SignIn from "./SignIn";


function Dashboard() {
  return (
    <div className="container">

      <Navbar />

      <h1>
        <span>Scientific Collaboration</span><br />
        <span>Network Analyzer</span>
      </h1>


      <p className="subtitle">
        Visualizing scientific collaborations through intelligent network analysis.
      </p>


      <div className="hero">

        <div className="hero-content">

          <button className="launch-btn">
            Start Analysis
          </button>

        </div>


        <NetworkGraph />

      </div>


      <UserRoles />


    </div>
  );
}



function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* First page when website opens */}
        <Route
          path="/"
          element={<SignIn />}
        />


        {/* Authentication pages */}
        <Route
          path="/signin"
          element={<SignIn />}
        />


        <Route
          path="/login"
          element={<Login />}
        />


        {/* After login */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* Existing pages */}
        <Route
          path="/researchers"
          element={<Researchers />}
        />


        <Route
          path="/institutions"
          element={<Institutions />}
        />


        <Route
          path="/reviewers"
          element={<Reviewers />}
        />


        <Route
          path="/admin"
          element={<Admin />}
        />


      </Routes>


    </BrowserRouter>

  );

}


export default App;