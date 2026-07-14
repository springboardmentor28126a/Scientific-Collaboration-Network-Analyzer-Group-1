import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
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

            <Sidebar />

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