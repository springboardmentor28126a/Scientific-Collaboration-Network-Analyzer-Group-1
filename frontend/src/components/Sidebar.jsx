import { Link } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBook,
  FaUniversity,
  FaChalkboardTeacher,
  FaSignOutAlt,
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

      <Link className="logout" to="/">
  🚪 Logout
</Link>

    </div>
  );
}

export default Sidebar;