import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "⬡" },
  { to: "/publications", label: "Publications", icon: "📄" },
  { to: "/projects", label: "Projects", icon: "🔬" },
  { to: "/conferences", label: "Conferences", icon: "🎙" },
  { to: "/collaborations", label: "Collaborations", icon: "🤝" },
  { to: "/citations", label: "Citations", icon: "🔗" },
  { to: "/institutions", label: "Institutions", icon: "🏛" },
  { to: "/reports", label: "Reports", icon: "📊" },
];

const getRoleColor = (role) => {
  if (role === "SystemAdmin") return "#f59e0b";
  if (role === "InstitutionAdmin") return "#10b981";
  return "#4f7fff";
};

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const auditItems = (user?.role === "SystemAdmin" || user?.role === "InstitutionAdmin")
    ? [{ to: "/audit", label: "Audit Log", icon: "🛡" }]
    : [];

  const allNavItems = [...NAV_ITEMS, ...auditItems];

  return (
    <div className="app-shell">
      {/* Top Header */}
      <header className="app-header">
        <div className="app-brand">
          <div className="app-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="13" stroke="url(#grad)" strokeWidth="1.5"/>
              <circle cx="8" cy="14" r="3.5" fill="url(#grad)"/>
              <circle cx="20" cy="9" r="3.5" fill="url(#grad2)"/>
              <circle cx="20" cy="19" r="3.5" fill="url(#grad3)"/>
              <line x1="11.5" y1="14" x2="16.7" y2="10.5" stroke="rgba(79,127,255,0.6)" strokeWidth="1"/>
              <line x1="11.5" y1="14" x2="16.7" y2="17.5" stroke="rgba(79,127,255,0.6)" strokeWidth="1"/>
              <line x1="16.8" y1="10.5" x2="16.8" y2="17.5" stroke="rgba(124,58,237,0.4)" strokeWidth="1"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f7fff"/>
                  <stop offset="1" stopColor="#7c3aed"/>
                </linearGradient>
                <linearGradient id="grad2" x1="17" y1="6" x2="23" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06b6d4"/>
                  <stop offset="1" stopColor="#4f7fff"/>
                </linearGradient>
                <linearGradient id="grad3" x1="17" y1="16" x2="23" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed"/>
                  <stop offset="1" stopColor="#4f7fff"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="app-brand-text">
            <span className="app-eyebrow">Scientific Collaboration</span>
            <span className="app-title">ResearchNet</span>
          </div>
        </div>

        <div className="app-header-right">
          <div className="app-user-chip">
            <div className="app-user-avatar" style={{ background: getRoleColor(user?.role) }}>
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="app-user-info">
              <span className="app-user-email">{user?.email}</span>
              <span className="app-user-role" style={{ color: getRoleColor(user?.role) }}>
                {user?.role}
              </span>
            </div>
          </div>
          <button onClick={logout} className="app-logout" aria-label="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sign out</span>
          </button>
          <button
            className="app-mobile-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileNavOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`app-nav ${mobileNavOpen ? "app-nav--open" : ""}`} aria-label="Workspace navigation">
        {allNavItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `app-nav-link ${isActive ? "app-nav-link--active" : ""}`}
            onClick={() => setMobileNavOpen(false)}
          >
            <span className="app-nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Page Content */}
      <main className="app-content">
        {children}
      </main>
    </div>
  );
}
