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
  FaLink
} from "react-icons/fa";

import "../styles/sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">

      <h2 className="menu-title">MENU</h2>

      <Link to="/dashboard">
        <FaHome /> Dashboard
      </Link>

      <Link to="/researchers">
        <FaUsers /> Researchers
      </Link>

      <Link to="/publications">
        <FaBook /> Publications
      </Link>

      <Link to="/conferences">
        <FaChalkboardTeacher /> Conferences
      </Link>

      <Link to="/institutions">
        <FaUniversity /> Institutions
      </Link>

      <h2
        className="menu-title"
        style={{
          marginTop: "25px",
          fontSize: "15px",
          color: "#ff3b3b",
        }}
      >
        Collaboration Management
      </h2>

      <Link to="/collaboration-graph">
        <FaProjectDiagram /> Collaboration Graph
      </Link>

      <Link to="/projects">
        <FaProjectDiagram /> Projects
      </Link>

      <Link to="/teams">
        <FaUsersCog /> Teams
      </Link>

      <Link to="/project-assignments">
        <FaUsers /> Project Assignments
      </Link>

      <Link to="/institution-collaborations">
        <FaHandshake /> Institutional Collaborations
      </Link>
     <Link to="/citations">
    <FaBook /> Citations
</Link>

<Link to="/references">
    <FaLink /> References
</Link>
<Link className="logout" to="/">
        🚪 Logout
      </Link>
    </div>
  );
}

export default Sidebar;