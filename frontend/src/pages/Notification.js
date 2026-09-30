import { useEffect, useState } from "react";
import API from "../api";

function Notification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notification/");
      setNotifications(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const markAsRead = async (id) => {
    await API.put(`/notification/${id}`, {
      is_read: "Yes",
    });

    fetchNotifications();
  };

  const deleteNotification = async (id) => {
    await API.delete(`/notification/${id}`);
    fetchNotifications();
  };

  return (
    <div className="container mt-4">
      <h2>Notifications</h2>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Message</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {notifications.map((n) => (
            <tr key={n.id}>
              <td>{n.id}</td>
              <td>{n.message}</td>
              <td>{n.is_read}</td>

              <td>
                <button
                  className="btn btn-success btn-sm me-2"
                  onClick={() => markAsRead(n.id)}
                >
                  Mark Read
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteNotification(n.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Notification;
