import "./App.css";

import Navbar from "./components/Navbar";
import UserRoles from "./components/UserRoles";
import NetworkGraph from "./components/NetworkGraph";
import Dashboard from "./components/Dashboard";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Researchers from "./pages/Researchers";
import Institutions from "./pages/Institutions";
import Conference from "./pages/Conference";
import Citation from "./pages/Citation";
import Reviewers from "./pages/Reviewers";
import Admin from "./pages/Admin";

import Login from "./Login";
import SignIn from "./SignIn";


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


        {/* Dashboard */}
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
          path="/conference"
          element={<Conference />}
        />


        {/* Citation Management */}
        <Route
          path="/citation"
          element={<Citation />}
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