import { useNavigate, useLocation } from "react-router-dom";
import {
    FaHome,
    FaUser,
    FaBook,
    FaUsers,
    FaBell
} from "react-icons/fa";
import {FaSearch } from "react-icons/fa";
import { FaUniversity } from "react-icons/fa";
import { FaSchool } from "react-icons/fa";

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
    text="My Publications"
    active={location.pathname === "/my-publications"}
    onClick={() => navigate("/my-publications")}
/>

<MenuItem
    icon={<FaSearch />}
    text="Search Publications"
    active={location.pathname === "/search-publications"}
    onClick={() => navigate("/search-publications")}
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
<MenuItem

icon={<FaUniversity/>}

text="Conference Organization"

active={location.pathname==="/conference"}

onClick={()=>navigate("/conference")}

/>
<MenuItem

icon={<FaSchool/>}

text="Institution Management"

active={location.pathname==="/institution"}

onClick={()=>navigate("/institution")}

/>
<MenuItem

icon={<FaSearch/>}

text="Research Search"

active={location.pathname==="/search"}

onClick={()=>navigate("/search")}

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