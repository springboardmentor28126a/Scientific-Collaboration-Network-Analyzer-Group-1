import { Outlet } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import TopNavbar from "../components/TopNavbar";

function DashboardLayout() {

    return (

        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f4f7fb"
            }}
        >

            {/* Sidebar */}

            <Dashboard />

            {/* Right Content */}

            <div
                style={{
                    flex: 1,
                    padding: "30px",
                    overflowY: "auto"
                }}
            >
                <TopNavbar />
                <Outlet />

            </div>

        </div>

    );

}

export default DashboardLayout;