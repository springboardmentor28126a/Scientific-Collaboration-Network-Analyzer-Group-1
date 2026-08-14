import "../styles/navbar.css";
import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";

import {
  getPendingCollaborations,
  acceptCollaboration,
  rejectCollaboration,
} from "../services/institutionCollaborationService";
import api from "../services/api";

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
useEffect(() => {
    const loadNotifications = async () => {
        try {
            const data = await getPendingCollaborations();

            console.log("ALL COLLABORATIONS:", data);

            const pendingRequests = data.filter(
                (item) => item.status === "Pending"
            );

            console.log("PENDING REQUESTS:", pendingRequests);

            setRequests(pendingRequests);
        } catch (error) {
            console.log("Notification error:", error);
        }
    };

    loadNotifications();
}, []);
useEffect(() => {
  const loadAuditNotifications = async () => {
    try {
      const response = await api.get("/audit/");

      const filteredNotifications = response.data.filter(
        (item) =>
          allowedNotificationActions.includes(item.action)
      );

      setNotifications(filteredNotifications);

      console.log(
        "AUDIT NOTIFICATIONS:",
        filteredNotifications
      );
    } catch (error) {
      console.log("Audit notification error:", error);
    }
  };

  loadAuditNotifications();

  // Refresh notifications every 3 seconds
  const interval = setInterval(loadAuditNotifications, 3000);

  return () => clearInterval(interval);
}, []);
  // Collaboration requests
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const allowedNotificationActions = [
    "COLLABORATION_REQUEST_SENT",
    "COLLABORATION_ACCEPTED",
    "COLLABORATION_REJECTED",
    "RESEARCHER_ADDED",
    "RESEARCHER_ADDED_TO_PROJECT",
    "PUBLICATION_APPROVED",
    "PUBLICATION_REJECTED",
    "CITATION_ADDED",
    "CONFERENCE_REGISTRATION_COMPLETED"
];
  const today = new Date().toLocaleDateString("en-GB");
  // Accept request
  const acceptRequest = async (id) => {
  try {
    await acceptCollaboration(id);

    setRequests((prev) =>
      prev.filter((item) => item.id !== id)
    );

  } catch (error) {
    console.log("Accept request error:", error);
  }
};
  // Ignore request
const ignoreRequest = async (id) => {
  try {
    await rejectCollaboration(id);

    setRequests((prev) =>
      prev.filter((item) => item.id !== id)
    );

  } catch (error) {
    console.log("Ignore request error:", error);
  }
};

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#111827",
        height: "75px",
        padding: "0 25px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "30px",
          fontWeight: "bold",
          color: "#60a5fa",
        }}
      >
        🔬 SCNA Dashboard
      </div>

      {/* Right Side */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Notification Bell */}
        <div
          style={{
            position: "relative",
            cursor: "pointer",
          }}
        >
          <FaBell
            size={22}
            color="white"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
          />

          {/* Notification Count */}
          {(requests.length + notifications.length) > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-9px",
                right: "-9px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                width: "19px",
                height: "19px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
             {requests.length + notifications.length}
            </span>
          )}

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "35px",
                right: "0",
                width: "360px",
                background: "#1b1b1b",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "15px",
                zIndex: 1000,
                boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
              }}
            >
              <h3
                style={{
                  color: "white",
                  margin: "0 0 15px 0",
                }}
              >
                Notifications
              </h3>

              {/* No Requests */}
              {requests.length === 0 && notifications.length === 0 && (
                <div
                  style={{
                    color: "#aaa",
                    padding: "15px 0",
                    textAlign: "center",
                  }}
                >
                  No New Notifications
                </div>
              )}

              {/* Requests */}
              {requests.map((request) => (
                <div
                  key={request.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #333",
                  }}
                >
                  <div
                    style={{
                      color: "#ddd",
                      fontSize: "15px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
    style={{
        color: "#ddd",
        fontSize: "15px",
        marginBottom: "10px",
    }}
>
    🤝 <strong>Collaboration Request</strong>

    <div style={{ marginTop: "6px", color: "#aaa" }}>
        Institution {request.institution_a_id} → Institution{" "}
        {request.institution_b_id}
    </div>

    <div style={{ marginTop: "4px", color: "#aaa" }}>
        Type: {request.collaboration_type}
    </div>
</div>
                  </div>

                  {/* Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <button
  onClick={() => acceptRequest(request.id)}
  style={{
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "6px 14px",
    cursor: "pointer",
    fontWeight: "600",
  }}
>
  Accept
</button>

                    <button
                      onClick={() => ignoreRequest(request.id)}
                      style={{
                        background: "#333",
                        color: "#ddd",
                        border: "1px solid #555",
                        borderRadius: "5px",
                        padding: "6px 14px",
                        cursor: "pointer",
                      }}
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))}
              {notifications.map((notification) => (
    <div
        key={`audit-${notification.id}`}
        style={{
            padding: "12px 0",
            borderBottom: "1px solid #333",
        }}
    >
        <div
            style={{
                color: "#fff",
                fontSize: "15px",
                fontWeight: "600",
                marginBottom: "5px",
            }}
        >
            🔔 {notification.action.replaceAll("_", " ")}
        </div>

        <div
            style={{
                color: "#aaa",
                fontSize: "13px",
            }}
        >
            {notification.description}
        </div>

        <div
            style={{
                color: "#666",
                fontSize: "11px",
                marginTop: "5px",
            }}
        >
            {new Date(notification.created_at).toLocaleString()}
        </div>
    </div>
))}
            </div>
          )}
        </div>

        {/* Online */}
        <span style={{ color: "#22c55e" }}>
          🟢 Online
        </span>

        {/* User */}
        <span style={{ color: "white" }}>
          👤 Pankaj Sharma
        </span>

        {/* Date */}
        <span style={{ color: "white" }}>
          📅 {today}
        </span>
      </div>
    </nav>
  );
}

export default Navbar;