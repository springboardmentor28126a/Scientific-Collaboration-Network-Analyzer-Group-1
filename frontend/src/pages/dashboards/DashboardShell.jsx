import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/dashboard.css";

function DashboardShell({ title, children }) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dash-shell">
      <header className="dash-topbar">
        <span className="dash-logo">SciConnect</span>
        <div className="dash-user">
          <span>{auth?.username} · {auth?.role.replaceAll("_", " ")}</span>
          <button className="btn-ghost-dark" onClick={handleLogout}>Log out</button>
        </div>
      </header>
      <main className="dash-main container">
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}

export default DashboardShell;