import axiosClient from "./axios";

// =========================================================
// GET CURRENT USER NOTIFICATIONS
// =========================================================

export const getNotifications = () => {
  return axiosClient.get("/notifications");
};

// =========================================================
// GET UNREAD NOTIFICATION COUNT
// =========================================================

export const getUnreadNotificationCount = () => {
  return axiosClient.get("/notifications/unread-count");
};

// =========================================================
// CREATE NOTIFICATION
// =========================================================

export const createNotification = (data) => {
  return axiosClient.post("/notifications", data);
};

// =========================================================
// MARK ONE NOTIFICATION AS READ
// =========================================================

export const markNotificationAsRead = (id) => {
  return axiosClient.patch(`/notifications/${id}/read`);
};

// =========================================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================================

export const markAllNotificationsAsRead = () => {
  return axiosClient.patch("/notifications/mark-all-read");
};

// =========================================================
// DELETE NOTIFICATION
// =========================================================

export const deleteNotification = (id) => {
  return axiosClient.delete(`/notifications/${id}`);
};