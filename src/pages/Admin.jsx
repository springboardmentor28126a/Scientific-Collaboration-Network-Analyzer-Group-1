import { Users, ShieldCheck, Settings, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Admin() {
    const navigate = useNavigate();
  return (
    <div className="admin-page">
     <Navbar />

      <h1>System Administration</h1>

      <p className="page-description">
        Manage platform operations, user access and system configuration.
      </p>
      <button
  className="back-btn"
  onClick={() => navigate("/")}
>
  Back to Home
</button>


      <div className="search-box">

        <Search className="search-icon" />

        <input
          type="text"
          placeholder="Search system options..."
        />

      </div>


      <div className="admin-features">


        <div className="feature-card">

          <Users className="feature-icon" />

          <h3>User Management</h3>

          <p>
            Manage users and platform access.
          </p>

        </div>



        <div className="feature-card">

          <ShieldCheck className="feature-icon" />

          <h3>Role Management</h3>

          <p>
            Control permissions and user roles.
          </p>

        </div>



        <div className="feature-card">

          <Settings className="feature-icon" />

          <h3>System Configuration</h3>

          <p>
            Configure and monitor system settings.
          </p>

        </div>


      </div>


    </div>
  );
}

export default Admin;