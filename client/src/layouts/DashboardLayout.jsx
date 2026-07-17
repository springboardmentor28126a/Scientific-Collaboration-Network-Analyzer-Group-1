import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

function DashboardLayout({ theme, toggleTheme }) {

    return (

        <div
            style={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
                background: "var(--page-bg)"
            }}
        >

            {/* Sidebar */}

            <Sidebar theme={theme} />

            {/* Right Content */}

            <div
                style={{
                    flex: 1,
                    padding: "28px",
                    height: "100vh",
                    overflowY: "auto",
                    position: "relative"
                }}
            >
                <TopNavbar theme={theme} toggleTheme={toggleTheme} />
                <div style={{ animation: "fadeIn 0.35s ease" }}>
                    <Outlet />
                </div>
            </div>

        </div>

    );
}

const styles = {
    fadeIn: {
        animation: "fadeIn 0.35s ease"
    }
};

export default DashboardLayout;