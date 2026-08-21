import { useEffect, useState } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, AlertCircle, Trash2, CheckCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Helper to categorize notifications
  const categorizeNotifications = () => {
    const today = [];
    const yesterday = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

    notifications.forEach((item) => {
      const date = new Date(item.created_at);
      if (date >= startOfToday) {
        today.push(item);
      } else if (date >= startOfYesterday) {
        yesterday.push(item);
      } else {
        older.push(item);
      }
    });

    return { today, yesterday, older };
  };

  // Icon selector helper
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      case "info":
      default:
        return <Info size={20} />;
    }
  };

  const { today, yesterday, older } = categorizeNotifications();

  return (
    <div className="notifications-page">
      <Navbar />

      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Bell size={45} style={{ color: "#c1123f" }} />
          <div>
            <h1>Notifications</h1>
            <p>Stay updated on new publications, collaborative projects, and system activities.</p>
          </div>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={handleMarkAllAsRead}
            style={{
              padding: "10px 20px",
              background: "rgba(193, 18, 63, 0.15)",
              border: "1px solid rgba(193, 18, 63, 0.4)",
              borderRadius: "8px",
              color: "#c1123f",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <CheckCheck size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="notifications-container">
        {loading ? (
          <p style={{ color: "#c8b6bd", textAlign: "center" }}>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#c8b6bd" }}>
            <Bell size={60} style={{ opacity: 0.3, marginBottom: "15px" }} />
            <h3 style={{ color: "white" }}>All caught up!</h3>
            <p>You have no notifications at this time.</p>
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <div>
                <h3 className="notification-group-title">Today</h3>
                {today.map((item) => (
                  <NotificationItem 
                    key={item.id} 
                    item={item} 
                    onRead={handleMarkAsRead} 
                    onDelete={handleDelete} 
                    getIcon={getNotificationIcon} 
                  />
                ))}
              </div>
            )}

            {yesterday.length > 0 && (
              <div>
                <h3 className="notification-group-title">Yesterday</h3>
                {yesterday.map((item) => (
                  <NotificationItem 
                    key={item.id} 
                    item={item} 
                    onRead={handleMarkAsRead} 
                    onDelete={handleDelete} 
                    getIcon={getNotificationIcon} 
                  />
                ))}
              </div>
            )}

            {older.length > 0 && (
              <div>
                <h3 className="notification-group-title">Older</h3>
                {older.map((item) => (
                  <NotificationItem 
                    key={item.id} 
                    item={item} 
                    onRead={handleMarkAsRead} 
                    onDelete={handleDelete} 
                    getIcon={getNotificationIcon} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NotificationItem({ item, onRead, onDelete, getIcon }) {
  return (
    <div className={`notification-card ${!item.is_read ? "unread" : ""}`} style={{ marginBottom: "12px" }}>
      <div className={`notification-icon-container ${item.notification_type}`}>
        {getIcon(item.notification_type)}
      </div>
      
      <div className="notification-content">
        <h3>{item.title}</h3>
        <p>{item.message}</p>
        <span className="notification-time">
          {new Date(item.created_at).toLocaleString()}
        </span>
      </div>

      <div className="notification-actions">
        {!item.is_read && (
          <button 
            className="notification-action-btn read" 
            onClick={() => onRead(item.id)} 
            title="Mark as read"
          >
            <CheckCircle size={16} />
          </button>
        )}
        <button 
          className="notification-action-btn delete" 
          onClick={() => onDelete(item.id)} 
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default Notifications;
