import { Link } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBook,
  FaUniversity,
  FaChalkboardTeacher,
  FaProjectDiagram,
  FaUsersCog,
  FaHandshake,
  FaLink,
  FaChartBar,
  FaSignOutAlt,
  FaTasks,
  FaQuoteRight,
  FaClipboardList,
} from "react-icons/fa";

import "../styles/sidebar.css";

function Sidebar() {

  // Get role from JWT token
  const token = localStorage.getItem("token");

  let userRole = "researcher";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userRole = payload.role || "researcher";
    } catch (error) {
      console.log("Invalid token");
    }
  }

  return (
    <div className="sidebar">

      <h2 className="menu-title">MENU</h2>

      {/* Common */}
      <Link to="/dashboard">
        <FaHome /> Dashboard
      </Link>


      {/* ================= RESEARCHER ================= */}
      {userRole === "researcher" && (
        <>
          <Link to="/researchers">
            <FaUsers /> Researchers
          </Link>

          <Link to="/publications">
            <FaBook /> Publications
          </Link>

          <Link to="/conferences">
            <FaChalkboardTeacher /> Conferences
          </Link>

          <Link to="/projects">
            <FaProjectDiagram /> Projects
          </Link>

          <Link to="/project-assignments">
            <FaTasks /> Project Assignments
          </Link>

          <Link to="/citations">
            <FaQuoteRight /> Citations
          </Link>

          <Link to="/references">
            <FaLink /> References
          </Link>

          <Link to="/institution-collaborations">
            <FaHandshake /> Institutional Collaborations
          </Link>
        </>
      )}


      {/* ================= CLIENT ================= */}
      {userRole === "client" && (
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

          <Link to="/conferences">
            <FaChalkboardTeacher /> Conferences
          </Link>

          <Link to="/projects">
            <FaProjectDiagram /> Projects
          </Link>

          <Link to="/teams">
            <FaUsersCog /> Teams
          </Link>

          <Link to="/citations">
            <FaQuoteRight /> Citations
          </Link>

          <Link to="/references">
            <FaLink /> References
          </Link>

          <Link to="/audit">
            <FaClipboardList /> Audit & Compliance
          </Link>

          <div style={{ marginTop: "20px" }}>
            <Link to="/reports">
              <FaChartBar /> Reports
            </Link>
          </div>
        </>
      )}


      {/* Collaboration Graph - common */}
      <Link to="/collaboration-graph">
        <FaProjectDiagram /> Collaboration Graph
      </Link>


      {/* Logout */}
      <Link className="logout" to="/">
        <FaSignOutAlt /> Logout
      </Link>

    </div>
  );
}

export default Sidebar;