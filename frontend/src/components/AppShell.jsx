import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  CalendarDays,
  UsersRound,
  Quote,
  Building2,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  FlaskConical,
  UserSearch,
  Layers3,
} from "lucide-react";

import NotificationBell from "./NotificationBell";

import "./AppShell.css";


/* =========================================================
   MAIN NAVIGATION
   ========================================================= */

const NAV_ITEMS = [

  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    to: "/researchers",
    label: "Researchers",
    icon: UserSearch,
  },

  {
    to: "/institutions",
    label: "Institutions",
    icon: Building2,
  },

  {
    to: "/departments",
    label: "Departments",
    icon: Layers3,
  },

  {
    to: "/publications",
    label: "Publications",
    icon: FileText,
  },

  {
    to: "/projects",
    label: "Research Projects",
    icon: FolderKanban,
  },

  {
    to: "/conferences",
    label: "Conferences",
    icon: CalendarDays,
  },

  {
    to: "/collaborations",
    label: "Collaborations",
    icon: UsersRound,
  },

  {
    to: "/citations",
    label: "Citations",
    icon: Quote,
  },

  {
    to: "/reports",
    label: "Reports & Exports",
    icon: BarChart3,
  },

];


export default function AppShell({ children }) {

  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] =
    useState(false);


  /* =========================================================
     AUDIT NAVIGATION
     ========================================================= */

  const auditItems =
    user?.role === "SystemAdmin" ||
    user?.role === "InstitutionAdmin"
      ? [
          {
            to: "/audit",
            label: "Audit Log",
            icon: ShieldCheck,
          },
        ]
      : [];


  /* =========================================================
     ALL NAVIGATION ITEMS
     ========================================================= */

  const allNavItems = [
    ...NAV_ITEMS,
    ...auditItems,
  ];


  /* =========================================================
     USER DISPLAY
     ========================================================= */

  const displayName =
    user?.email?.split("@")[0] || "User";


  return (

    <div className="app-shell">


      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside
        className={`app-sidebar ${
          mobileNavOpen
            ? "app-sidebar--open"
            : ""
        }`}
      >


        {/* =================================================
            BRAND
            ================================================= */}

        <div className="app-sidebar-brand">

          <div className="app-logo">

            <FlaskConical
              size={22}
              strokeWidth={1.8}
            />

          </div>


          <div className="app-brand-text">

            <span className="app-eyebrow">
              Scientific Collaboration
            </span>

            <span className="app-title">
              Research Hub
            </span>

          </div>

        </div>


        <div className="app-sidebar-divider" />


        {/* =================================================
            NAVIGATION LABEL
            ================================================= */}

        <div className="app-navigation-label">
          Workspace
        </div>


        {/* =================================================
            NAVIGATION
            ================================================= */}

        <nav
          className="app-nav"
          aria-label="Workspace navigation"
        >

          {allNavItems.map(
            ({
              to,
              label,
              icon: Icon,
            }) => (

              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `app-nav-link ${
                    isActive
                      ? "app-nav-link--active"
                      : ""
                  }`
                }
                onClick={() =>
                  setMobileNavOpen(false)
                }
              >

                <Icon
                  size={17}
                  strokeWidth={1.8}
                />

                <span>
                  {label}
                </span>

              </NavLink>

            )
          )}

        </nav>


        {/* =================================================
            SIDEBAR BOTTOM
            ================================================= */}

        <div className="app-sidebar-bottom">


          {/* USER CARD */}

          <div className="app-user-card">

            <div className="app-user-avatar">

              {user?.email?.[0]?.toUpperCase() ||
                "U"}

            </div>


            <div className="app-user-info">

              <span className="app-user-name">
                {displayName}
              </span>

              <span className="app-user-role">
                {user?.role || "User"}
              </span>

            </div>

          </div>


          {/* LOGOUT */}

          <button
            onClick={logout}
            className="app-logout"
          >

            <LogOut size={16} />

            <span>
              Sign out
            </span>

          </button>


        </div>


      </aside>


      {/* =================================================
          MOBILE HEADER
          ================================================= */}

      <header className="app-mobile-header">

        <div className="app-mobile-brand">

          <div className="app-mobile-logo">
            <FlaskConical size={20} />
          </div>

          <span>
            Research Hub
          </span>

        </div>


        <button
          className="app-mobile-toggle"
          onClick={() =>
            setMobileNavOpen(
              !mobileNavOpen
            )
          }
          aria-label="Toggle navigation"
        >

          {mobileNavOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}

        </button>

      </header>


      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <main className="app-main">

        <div className="app-topbar">

          <NotificationBell />

        </div>


        <div className="app-content">
          {children}
        </div>

      </main>


    </div>

  );
}