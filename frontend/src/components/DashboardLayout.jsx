import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#111"
            }}
        >
            <Sidebar />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <Navbar />

                <main
                    style={{
                        flex: 1,
                        padding: "30px",
                        background: "#111",
                        overflow: "auto"
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;