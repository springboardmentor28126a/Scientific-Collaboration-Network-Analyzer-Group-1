import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV_BY_ROLE = {
  SYSTEM_ADMIN: [
    { label: "Overview", path: "/admin/dashboard" },
    { label: "Institutions", path: "/institutions" },
    { label: "Departments", path: "/departments" },
    { label: "Researchers", path: "/researchers" },
    { label: "Users", path: "/users" },
    { label: "Browse Publications", path: "/publications" },
    { label: "Conferences", path: "/conferences" } 
  ],
  INSTITUTION_ADMIN: [
    { label: "Overview", path: "/institution-admin/dashboard" },
    { label: "Departments", path: "/departments" },
    { label: "Researchers", path: "/researchers" },
    { label: "Browse Publications", path: "/publications" },
    { label: "Conferences", path: "/conferences" } 
  ],
  RESEARCHER: [
    { label: "Overview", path: "/researcher/dashboard" },
    { label: "Browse Publications", path: "/publications" },
    { label: "Conferences", path: "/conferences" } 
  ],
  REVIEWER: [
    { label: "Overview", path: "/reviewer/dashboard" },
    { label: "Browse Publications", path: "/publications" },
    { label: "Conferences", path: "/conferences" } 
  ],
};

function initials(username) {
  if (!username) return "?";
  return username.slice(0, 2).toUpperCase();
}

function Sidebar() {
  const { auth, logout } = useAuth();
  const navItems = NAV_BY_ROLE[auth?.role] || [];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-brand">SciConnect</div>

      <nav className="dash-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => "dash-nav-link" + (isActive ? " active" : "")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="dash-sidebar-footer">
        <div className="dash-user-chip">
          <span className="dash-avatar">{initials(auth?.username)}</span>
          <div>
            <div className="dash-user-name">{auth?.username}</div>
            <div className="dash-user-role">{auth?.role?.replaceAll("_", " ")}</div>
          </div>
        </div>
        <button className="dash-logout" onClick={handleLogout}>Log out</button>
      </div>
    </aside>
  );
}

export default Sidebar;