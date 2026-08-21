import { Users, Building2, FileCheck, Settings } from "lucide-react";
import { Link } from "react-router-dom";

function UserRoles() {
  return (
    <div className="roles-section">

      <h2>User Roles</h2>

      <div className="roles-container">

        <Link to="/researchers" className="role-link">
          <div className="role-card">
            <Users className="role-icon" />
            <h3>Researchers</h3>
          </div>
        </Link>

        <Link to="/institutions" className="role-link">
          <div className="role-card">
            <Building2 className="role-icon" />
            <h3>Institutions</h3>
          </div>
        </Link>

        <Link to="/reviewers" className="role-link">
          <div className="role-card">
            <FileCheck className="role-icon" />
            <h3>Reviewers</h3>
          </div>
        </Link>

        <Link to="/admin" className="role-link">
          <div className="role-card">
            <Settings className="role-icon" />
            <h3>System Administration</h3>
          </div>
        </Link>

      </div>

    </div>
  );
}

export default UserRoles;