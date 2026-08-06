import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../services/notificationService";
import { toast } from "react-toastify";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {
      toast.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      loadNotifications();
    } catch {
      toast.error("Failed to update notification");
    }
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h3 className="mb-4">Notifications</h3>

        {notifications.length === 0 ? (
          <div className="alert alert-info">
            No notifications found.
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card mb-3 ${
                notification.is_read ? "" : "border-primary"
              }`}
            >
              <div className="card-body">
                <h5>{notification.title}</h5>

                <p>{notification.message}</p>

                <small className="text-muted">
                  {new Date(notification.created_at).toLocaleString()}
                </small>

                {!notification.is_read && (
                  <div className="mt-3">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRead(notification.id)}
                    >
                      Mark as Read
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

export default NotificationsPage;