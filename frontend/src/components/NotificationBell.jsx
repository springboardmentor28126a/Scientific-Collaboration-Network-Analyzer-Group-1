import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
} from "lucide-react";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../api/notifications";

import "./NotificationBell.css";


export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const containerRef = useRef(null);


  const loadNotifications = async () => {
    try {
      const [notificationResponse, countResponse] =
        await Promise.all([
          getNotifications(),
          getUnreadNotificationCount(),
        ]);

      setNotifications(notificationResponse.data);
      setUnreadCount(countResponse.data.count);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };


  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };


  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark notifications as read:",
        error
      );
    }
  };


  const handleDelete = async (id) => {
    try {
      const notification = notifications.find(
        (item) => item.id === id
      );

      await deleteNotification(id);

      setNotifications((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (notification && !notification.is_read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error
      );
    }
  };


  const formatTime = (date) => {
    const value = new Date(date);

    return value.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <div
      className="notification-container"
      ref={containerRef}
    >

      <button
        type="button"
        className="notification-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>


      {open && (
        <div className="notification-panel">

          <div className="notification-header">

            <div>
              <span className="notification-eyebrow">
                Workspace
              </span>

              <h3>Notifications</h3>
            </div>

            <button
              type="button"
              className="notification-close"
              onClick={() => setOpen(false)}
            >
              <X size={17} />
            </button>

          </div>


          <div className="notification-actions">

            <span>
              {unreadCount} unread
            </span>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
            )}

          </div>


          <div className="notification-list">

            {notifications.length === 0 ? (

              <div className="notification-empty">

                <div className="notification-empty-icon">
                  <Bell size={20} />
                </div>

                <strong>No notifications</strong>

                <p>
                  You're all caught up.
                </p>

              </div>

            ) : (

              notifications.map((notification) => (

                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.is_read
                      ? "notification-item--unread"
                      : ""
                  }`}
                >

                  <div className="notification-item-icon">
                    <Bell size={16} />
                  </div>


                  <div className="notification-content">

                    <div className="notification-item-top">

                      <strong>
                        {notification.title}
                      </strong>

                      {!notification.is_read && (
                        <span className="notification-dot" />
                      )}

                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <span className="notification-time">
                      {formatTime(
                        notification.created_at
                      )}
                    </span>

                  </div>


                  <div className="notification-item-actions">

                    {!notification.is_read && (
                      <button
                        type="button"
                        title="Mark as read"
                        onClick={() =>
                          handleMarkRead(
                            notification.id
                          )
                        }
                      >
                        <Check size={15} />
                      </button>
                    )}

                    <button
                      type="button"
                      title="Delete"
                      onClick={() =>
                        handleDelete(
                          notification.id
                        )
                      }
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>
      )}

    </div>
  );
}