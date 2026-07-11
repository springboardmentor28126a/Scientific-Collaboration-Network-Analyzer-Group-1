import { useNavigate } from "react-router-dom";
import {
    FaMicroscope,
    FaHome,
    FaUser,
    FaBook,
    FaUsers,
    FaBell,
    FaCog,
    FaSignOutAlt,
    FaFileAlt,
    FaQuoteRight
} from "react-icons/fa";

import "./Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");

    };

    return (

        <div className="dashboard-container">

            {/* Sidebar */}

            <div className="sidebar">

                <div className="sidebar-logo">

                    <FaMicroscope className="logo-icon" />

                    <div>

                        <h2>SCNA</h2>

                        <small>Research Platform</small>

                    </div>

                </div>

                <div className="sidebar-menu">

                    <div className="menu-item active">

                        <FaHome />

                        <span>Dashboard</span>

                    </div>

                    <div
                        className="menu-item"
                        onClick={() => navigate("/profile")}
                    >

                        <FaUser />

                        <span>Profile</span>

                    </div>

                    <div
                        className="menu-item"
                        onClick={() => navigate("/publications")}
                    >

                        <FaBook />

                        <span>Publications</span>

                    </div>

                    <div className="menu-item">

                        <FaUsers />

                        <span>Collaborations</span>

                    </div>

                    <div className="menu-item">

                        <FaBell />

                        <span>Notifications</span>

                    </div>

                    <div className="menu-item">

                        <FaCog />

                        <span>Settings</span>

                    </div>

                </div>

                <div
                    className="logout-btn"
                    onClick={logout}
                >

                    <FaSignOutAlt />

                    <span>Logout</span>

                </div>

            </div>

            {/* Main Content */}

            <div className="dashboard-main">

                <div className="dashboard-header">

                    <h1>

                        Welcome Back, {user?.name} 👋

                    </h1>

                    <p className="dashboard-role">

                        Role : {user?.role}

                    </p>

                </div>
                <div className="dashboard-cards">

                    <div className="dashboard-card">

                        <FaBook className="card-icon" />

                        <h3>Publications</h3>

                        <h1>12</h1>

                    </div>

                    <div className="dashboard-card">

                        <FaUsers className="card-icon" />

                        <h3>Collaborations</h3>

                        <h1>4</h1>

                    </div>

                    <div className="dashboard-card">

                        <FaQuoteRight className="card-icon" />

                        <h3>Citations</h3>

                        <h1>38</h1>

                    </div>

                    <div className="dashboard-card">

                        <FaFileAlt className="card-icon" />

                        <h3>Pending Reviews</h3>

                        <h1>2</h1>

                    </div>

                </div>



            </div>

        </div>

    );

}

export default Dashboard;