import { useNavigate, useLocation } from "react-router-dom";
import {
    FaHome,
    FaUser,
    FaBook,
    FaUsers,
    FaBell
} from "react-icons/fa";

function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    return (

        <div
            style={{
                width: "250px",
                background: "#2563eb",
                color: "white",
                minHeight: "100vh",
                padding: "25px"
            }}
        >

            <h2>🔬 SCNA</h2>

            <p style={{ marginTop: "-10px", opacity: 0.8 }}>
                Research Platform
            </p>

            <hr />

            <MenuItem
                icon={<FaHome />}
                text="Dashboard"
                active={location.pathname === "/dashboard"}
                onClick={() => navigate("/dashboard")}
            />

            <MenuItem
    icon={<FaUsers />}
    text="Researchers"
    active={location.pathname === "/researchers"}
    onClick={() => navigate("/researchers")}
/>

            <MenuItem
                icon={<FaUser />}
                text="Profile"
                active={location.pathname === "/profile"}
                onClick={() => navigate("/profile")}
            />

            <MenuItem
                icon={<FaBook />}
                text="Publications"
                active={location.pathname === "/publications"}
                onClick={() => navigate("/publications")}
            />

            <MenuItem
                icon={<FaUsers />}
                text="Collaborations"
                active={location.pathname === "/collaborations"}
                onClick={() => navigate("/collaborations")}
            />

            <MenuItem
                icon={<FaBell />}
                text="Notifications"
                active={location.pathname === "/notifications"}
                onClick={() => navigate("/notifications")}
            />
            <MenuItem
    icon={<FaUsers />}
    text="Collaborations"
    active={
        location.pathname === "/collaborations"
    }
    onClick={() =>
        navigate("/collaborations")
    }
/>

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
                gap: "12px",
                padding: "14px",
                marginBottom: "10px",
                borderRadius: "10px",
                cursor: "pointer",
                background: active ? "rgba(255,255,255,.18)" : "transparent"
            }}
        >

            {icon}

            <span>{text}</span>

        </div>

    );

}

export default Sidebar;