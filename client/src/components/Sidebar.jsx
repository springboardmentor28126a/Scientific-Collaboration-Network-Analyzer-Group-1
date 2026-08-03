import { useNavigate, useLocation } from "react-router-dom";
import {
    FaHome,
    FaUsers,
    FaBookOpen,
    FaSearch,
    FaChartBar,
    FaProjectDiagram,
    FaPeopleArrows,
    FaSchool,
    FaCalendarAlt,
    FaComments
} from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";
function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    return (

        <div
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <span style={{ display: "inline-flex", width: "40px", height: "40px", alignItems: "center", justifyContent: "center", borderRadius: "14px", background: "rgba(34, 211, 238, 0.14)", color: "var(--accent)" }}>⚡</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "22px", letterSpacing: "0.02em" }}>SCNA</h2>
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>Connected research hub</p>
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
                text="Institution Management"
                active={location.pathname === "/institution"}
                onClick={() => navigate("/institution")}
            />

        </div>

    </div>

    );

}

function MenuItem({ icon, text, active, onClick }) {

    return (

        <div
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                marginBottom: "10px",
                borderRadius: "16px",
                cursor: "pointer",
                background: active ? "rgba(34, 211, 238, 0.15)" : "transparent",
                border: active ? "1px solid rgba(34, 211, 238, 0.3)" : "transparent",
                transition: "background 0.2s ease, transform 0.2s ease",
            }}
        >

            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "12px", background: active ? "rgba(34, 211, 238, 0.22)" : "rgba(255,255,255,0.06)", color: active ? "var(--accent)" : "var(--muted)" }}>
                {icon}
            </span>
            <span style={{ color: active ? "var(--text)" : "var(--muted)", fontWeight: active ? 600 : 500 }}>{text}</span>


        </div>
        

    );

}

export default Sidebar;