import { Link } from "react-router-dom";

import {
  FaHome,
  FaUsers,
  FaBook,
  FaUniversity,
  FaChalkboardTeacher,
  FaProjectDiagram,
  FaHandshake,
  FaChartBar,
  FaSignOutAlt,
  FaQuoteRight,
  FaClipboardList,
  FaTasks,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCheck,
} from "react-icons/fa";

import "../styles/sidebar.css";

function Sidebar() {
  const userRole = localStorage.getItem("role") || "researcher";

  return (
    <div className="sidebar">

      <h2 className="menu-title">MENU</h2>

      {/* ================= COMMON ================= */}

      <Link to="/dashboard">
        <FaHome /> Dashboard
      </Link>


      {/* ================= SUPER ADMIN ================= */}

      {userRole === "system_admin" && (
        <>
          <Link to="/researchers">
            <FaUsers /> Researchers
          </Link>

          <Link to="/institutions">
            <FaUniversity /> Institutions
          </Link>

          <Link to="/publications">
            <FaBook /> Publications
          </Link>

          <Link to="/citations">
            <FaQuoteRight /> Citations
          </Link>

          <Link to="/institution-collaborations">
            <FaHandshake /> Collaborations
          </Link>

          <Link to="/reports">
            <FaChartBar /> Research Analytics
          </Link>

          <Link to="/audit">
            <FaClipboardList /> Audit & Compliance
          </Link>
        </>
      )}


      {/* =========================
    INSTITUTION ADMIN
========================= */}

{userRole === "institution_admin" && (
  <>
    <Link to="/researchers">
      <FaUsers /> Researchers
    </Link>

    <Link to="/publications">
      <FaBook /> Publications
    </Link>

    <Link to="/citations">
      <FaQuoteRight /> Citations
    </Link>

    <Link to="/institution-collaborations">
      <FaHandshake /> Collaborations
    </Link>

    <Link to="/conferences">
      <FaChalkboardTeacher /> Conferences
    </Link>

    <Link to="/reports">
      <FaChartBar /> Analytics
    </Link>
  </>
)}

      {/* ================= RESEARCHER ================= */}

      {userRole === "researcher" && (
        <>
          <Link to="/publications">
            <FaBook /> My Publications
          </Link>

          <Link to="/citations">
            <FaQuoteRight /> My Citations
          </Link>

          <Link to="/institution-collaborations">
            <FaHandshake /> My Collaborators
          </Link>

          <Link to="/project-assignments">
            <FaTasks /> Collaboration Requests
          </Link>

          <Link to="/conferences">
            <FaChalkboardTeacher /> Conferences
          </Link>

          <Link to="/reports">
            <FaChartBar /> Statistics
          </Link>

          <Link to="/researchers">
            <FaUsers /> Recommended Researchers
          </Link>
        </>
      )}


      {/* ================= REVIEWER ================= */}

      {userRole === "reviewer" && (
        <>
          <Link to="/publications">
            <FaBook /> Publication Reviews
          </Link>

          <Link to="/citations">
            <FaQuoteRight /> Citation Verifications
          </Link>

          <Link to="/publications">
            <FaCheckCircle /> Approved Publications
          </Link>

          <Link to="/publications">
            <FaTimesCircle /> Rejected Publications
          </Link>

          <Link to="/citations">
            <FaCheckCircle /> Verified Citations
          </Link>

          <Link to="/citations">
            <FaTimesCircle /> Rejected Citations
          </Link>

          <Link to="/reports">
            <FaUserCheck /> Review Activity
          </Link>
        </>
      )}


      {/* ================= LOGOUT ================= */}

      <Link
        className="logout"
        to="/"
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
        }}
      >
        <FaSignOutAlt /> Logout
      </Link>

    </div>
  );
}

export default Sidebar;