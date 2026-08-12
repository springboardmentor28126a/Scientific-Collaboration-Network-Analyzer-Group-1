import api from "./api";

export const fetchNotifications = async () => {
  const response = await api.get("/notifications/");
  return response.data;
};

export const fetchUnreadCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data.count;
};

export const markNotificationRead = async (id, isRead = true) => {
  const response = await api.put(`/notifications/${id}`, { is_read: isRead });
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};