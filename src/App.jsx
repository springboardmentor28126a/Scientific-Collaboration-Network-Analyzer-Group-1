import "./App.css";

import Navbar from "./components/Navbar";
import UserRoles from "./components/UserRoles";
import NetworkGraph from "./components/NetworkGraph";
import Dashboard from "./components/Dashboard";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Researchers from "./pages/Researchers";
import Institutions from "./pages/Institutions";
import Conference from "./pages/Conference";
import Reviewers from "./pages/Reviewers";
import Admin from "./pages/Admin";
import FileUpload from "./pages/FileUpload";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";

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


        <Route
          path="/reviewers"
          element={<Reviewers />}
        />


        <Route
          path="/admin"
          element={<Admin />}
        />

        <Route
          path="/uploads"
          element={<FileUpload />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />


      </Routes>


    </BrowserRouter>

  );

}


export default App;