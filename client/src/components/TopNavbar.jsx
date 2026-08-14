import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import API from "../services/api";
import useDismissibleLayer from "../hooks/useDismissibleLayer";
import { clearAuth, getAuthUser } from "../utils/authStorage";

function TopNavbar() {

    const navigate = useNavigate();

    const user = getAuthUser();

    const [showMenu, setShowMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navbarRef = useDismissibleLayer(() => {
        setShowMenu(false);
        setShowNotifications(false);
    }, showMenu || showNotifications);

    useEffect(() => {
        let active = true;
        const refreshUnreadCount = () => API.get("/dashboard/notifications")
            .then(({ data }) => {
                if (active) setUnreadCount(data.filter((item) => !item.is_read).length);
            })
            .catch(() => {});
        refreshUnreadCount();
        const interval = window.setInterval(refreshUnreadCount, 30000);
        return () => { active = false; window.clearInterval(interval); };
    }, []);
    const logout = () => {

        clearAuth();

        navigate("/");

    };

    const openNotification = async (notification) => {
        if (!notification.is_read) {
            await API.put(`/dashboard/notifications/${notification.id}/read`);
            setUnreadCount((count) => Math.max(0, count - 1));
        }
        const routes = {
            publication: `/publication/${notification.resource_id}`,
            conference: `/conference/${notification.resource_id}`,
            verification: user?.role === "System Admin" ? "/verification-requests" : "/verification",
            group_invitation: "/invitations",
            research_group: `/groups/${notification.resource_id}`,
            meeting: "/groups",
            friend_request: "/collaborations",
            user: `/researcher/${notification.resource_id}`,
        };
        navigate(routes[notification.resource_type] || "/notifications");
        setShowNotifications(false);
    };

    return (

        <div
            ref={navbarRef}
            className="top-navbar"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                background: "var(--surface-alt)",
                borderRadius: "22px",
                boxShadow: "var(--shadow)",
                marginBottom: "25px",
                position: "relative",
                border: "1px solid var(--border)"
            }}
        >

            <h2
                className="top-navbar-title"
                style={{
                    margin: 0,
                    color: "var(--accent)"
                }}
            >
                Scientific Collaboration Network Analyzer
            </h2>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px"
                }}
            >

                <div style={{ position: "relative" }}>
                <button
                    type="button"
                    aria-label="Notifications"
                    onClick={async () => {
                        setShowNotifications((visible) => !visible);
                        const response = await API.get("/dashboard/notifications");
                        setNotifications(response.data || []);
                    }}
                    style={notificationButtonStyle}
                >
                    <FaBell />
                    {unreadCount > 0 && <span style={notificationBadgeStyle}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
                </button>
                {showNotifications && <div style={notificationPanelStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                        <strong>Notifications</strong>
                        <button type="button" onClick={() => navigate("/notifications")} style={{ padding: "4px 8px" }}>View all</button>
                    </div>
                    {notifications.slice(0, 5).map((notification) => <button key={notification.id} type="button" onClick={() => openNotification(notification)} style={{ display: "block", width: "100%", textAlign: "left", borderRadius: 0, borderBottom: "1px solid var(--border)", background: notification.is_read ? "transparent" : "var(--button-bg)" }}><strong>{notification.title}</strong><br /><small>{notification.message}</small></button>)}
                    {notifications.length === 0 && <p style={{ padding: "14px" }}>No notifications.</p>}
                </div>}
                </div>


                <div
                    style={{
                        position: "relative"
                    }}
                >
                    <div
                        onClick={() => setShowMenu(!showMenu)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer"
                        }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
                                color: "white",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontWeight: "bold",
                                fontSize: "20px",
                                boxShadow: "0 16px 40px rgba(34, 211, 238, 0.18)"
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <b>{user?.name}</b>
                            <br />
                            <small>{user?.role}</small>
                        </div>
                    </div>

                    {showMenu && (
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                top: 60,
                background: "var(--surface)",
                width: "220px",
                borderRadius: "12px",
                boxShadow: "var(--shadow)",
                overflow: "hidden",
                zIndex: 999,
                border: "1px solid var(--border)",
                color: "var(--text)"
            }}
                        >
                            <div
                                style={{
                                    padding: "20px",
                                    borderBottom: "1px solid var(--border)"
                                }}
                            >
                                <b>{user?.name}</b>
                                <br />
                                <small>{user?.email}</small>
                            </div>

                            <div
                                onClick={() => navigate("/profile")}
                                style={itemStyle}
                            >
                                My Profile
                            </div>

                            <div
                                onClick={() => navigate("/settings")}
                                style={itemStyle}
                            >
                                ⚙ Settings
                            </div>

                            <div
                                onClick={logout}
                                style={itemStyle}
                            >
                                Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const itemStyle = {
    padding: "15px",
    cursor: "pointer",
    borderBottom: "1px solid var(--border)"
};

const notificationButtonStyle = {
    position: "relative",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    background: "var(--surface)",
    color: "var(--text)",
    width: "40px",
    height: "40px",
    cursor: "pointer",
};

const notificationBadgeStyle = {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    minWidth: "18px",
    height: "18px",
    borderRadius: "999px",
    background: "#ef4444",
    color: "white",
    fontSize: "10px",
    display: "grid",
    placeItems: "center",
    padding: "0 4px",
};

const notificationPanelStyle = {
    position: "absolute",
    right: 0,
    top: 48,
    width: "340px",
    maxWidth: "80vw",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    boxShadow: "var(--shadow)",
    overflow: "hidden",
    zIndex: 1000,
};


export default TopNavbar;
