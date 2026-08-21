import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  UserCheck,
  Settings,
  UploadCloud,
  LogOut,
  User as UserIcon,
  TrendingUp,
  Bell
} from "lucide-react";
import api from "../api/api";


function Navbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications");
      const unread = response.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching unread count in navbar:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h2 className="logo">
        SciNexus
      </h2>

      <div className="sidebar-links" style={{ flex: 1 }}>
        <Link to="/dashboard">
          <LayoutDashboard size={20}/>
          Dashboard
        </Link>

        <Link to="/researchers">
          <Users size={20}/>
          Researchers
        </Link>

        <Link to="/institutions">
          <Building2 size={20}/>
          Institutions
        </Link>

        <Link to="/conference">
          <CalendarDays size={20}/>
          Conferences
        </Link>

        <Link to="/reviewers">
          <UserCheck size={20}/>
          Reviewers
        </Link>

        <Link to="/uploads">
          <UploadCloud size={20}/>
          File Uploads
        </Link>

        <Link to="/reports">
          <TrendingUp size={20}/>
          Reports
        </Link>

        <Link to="/notifications" style={{ display: "flex", alignItems: "center" }}>
          <Bell size={20}/>
          Notifications
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </Link>

        <Link to="/admin">
          <Settings size={20}/>
          Admin
        </Link>
      </div>

      {/* User Profile Card and Logout */}
      {currentUser && (
        <div style={{
          marginTop: "auto",
          padding: "15px",
          borderTop: "2px solid rgba(16, 42, 86, 0.4)",
          background: "rgba(5, 8, 18, 0.5)",
          borderRadius: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #5a0018, #c1123f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}>
              <UserIcon size={18} />
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ 
                fontWeight: "600", 
                fontSize: "14px", 
                color: "white",
                whiteSpace: "nowrap", 
                overflow: "hidden", 
                textOverflow: "ellipsis" 
              }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: "12px", color: "#c1123f", fontWeight: "bold" }}>
                {currentUser.role}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              marginTop: "5px",
              padding: "10px",
              background: "rgba(193, 18, 63, 0.15)",
              border: "1px solid rgba(193, 18, 63, 0.4)",
              borderRadius: "8px",
              color: "#c1123f",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(193, 18, 63, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(193, 18, 63, 0.15)";
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}

export default Navbar;