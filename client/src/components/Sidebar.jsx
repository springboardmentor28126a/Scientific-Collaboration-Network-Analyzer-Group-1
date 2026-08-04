import { useNavigate, useLocation } from "react-router-dom";
import {
    FaHome,
    FaBookOpen,
    FaSearch,
    FaChartBar,
    FaProjectDiagram,
    FaPeopleArrows,
    FaSchool,
    FaCalendarAlt,
    FaComments,
    FaEnvelope,
    FaShieldAlt
} from "react-icons/fa";

function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();
    return (

        <div
            className="sidebar-shell"
            style={{
                width: "260px",
                background: "var(--sidebar)",
                color: "var(--sidebar-text)",
                minHeight: "100vh",
                height: "100vh",
                padding: "30px",
                borderRight: "1px solid var(--border)",
                overflowY: "auto"
            }}
        >

            <div style={{ marginBottom: "32px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "12px"
                    }}
                >
                    <span
                        style={{
                            display: "inline-flex",
                            width: "40px",
                            height: "40px",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "14px",
                            background: "rgba(34,211,238,.14)",
                            color: "var(--accent)"
                        }}
                    >
                        ⚡
                    </span>

                    <div>

                        <h2 style={{ margin: 0 }}>SCNA</h2>

                        <p
                            style={{
                                margin: 0,
                                color: "var(--muted)",
                                fontSize: "13px"
                            }}
                        >
                            Connected Research Hub
                        </p>

                    </div>

                </div>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>

            <MenuItem
                icon={<FaHome />}
                text="Dashboard"
                active={location.pathname === "/dashboard"}
                onClick={() => navigate("/dashboard")}
            />

            {/* <MenuItem
                icon={<FaUsers />}
                text="Researchers"
                active={location.pathname === "/researchers"}
                onClick={() => navigate("/researchers")}
            /> */}

            <MenuItem
                icon={<FaBookOpen />}
                text="Publications"
                active={
                    location.pathname === "/publications" ||
                    location.pathname === "/my-publications"
                }
                onClick={() => navigate("/publications")}
            />

            <MenuItem
    icon={<FaSearch />}
    text="Search"
    active={
        location.pathname === "/search" ||
        location.pathname === "/search-publications"
    }
    onClick={() => navigate("/search")}
/>

            <MenuItem
                icon={<FaChartBar />}
                text="Analytics"
                active={location.pathname === "/analytics"}
                onClick={() => navigate("/analytics")}
            />

            <MenuItem
                icon={<FaProjectDiagram />}
                text="Network Graph"
                active={location.pathname === "/network"}
                onClick={() => navigate("/network")}
            />
            <MenuItem
    icon={<FaEnvelope />}
    text="Invitations"
    active={location.pathname === "/invitations"}
    onClick={() => navigate("/invitations")}
/>

            <MenuItem
                icon={<FaShieldAlt />}
                text="Verification Requests"
                roles={["Faculty", "System Admin"]}
                active={location.pathname === "/verification-requests"}
                onClick={() => navigate("/verification-requests")}
            />

            <MenuItem
    icon={<FaPeopleArrows />}
    text="Research Groups"
    active={location.pathname.startsWith("/groups")}
    onClick={() => navigate("/groups")}
/>
            <MenuItem
    icon={<FaComments />}
    text="Chat"
    active={location.pathname.startsWith("/groups")}
    onClick={() => navigate("/chat")}
/>

            <MenuItem
                icon={<FaCalendarAlt />}
                text="Conference Organization"
                active={location.pathname === "/conference"}
                onClick={() => navigate("/conference")}
            />

            <MenuItem
                icon={<FaSchool />}
                text="Institutions"
                active={location.pathname === "/institution"}
                onClick={() => navigate("/institution")}
            />

            <MenuItem
                icon={<FaSchool />}
                text="Institution Management"
                roles={["Institution Admin", "System Admin"]}
                active={location.pathname === "/institution/manage"}
                onClick={() => navigate("/institution/manage")}
            />

            </div>

        </div>

    );

}

function MenuItem({ icon, text, active, onClick, roles }) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (roles && user?.role !== "System Admin" && !roles.includes(user?.role)) {
        return null;
    }

    return (

        <div
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                borderRadius: "16px",
                cursor: "pointer",
                background: active
                    ? "rgba(34,211,238,.15)"
                    : "transparent",
                border: active
                    ? "1px solid rgba(34,211,238,.3)"
                    : "transparent",
                transition: ".25s"
            }}
        >

            <span
                style={{
                    display: "inline-flex",
                    width: "32px",
                    height: "32px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    background: active
                        ? "rgba(34,211,238,.22)"
                        : "rgba(255,255,255,.05)"
                }}
            >
                {icon}
            </span>

            <span
                style={{
                    fontWeight: active ? 600 : 500
                }}
            >
                {text}
            </span>

        </div>
        

    );

}

export default Sidebar;
