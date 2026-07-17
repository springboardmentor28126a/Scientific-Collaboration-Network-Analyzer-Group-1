import Sidebar from "../components/dashboard/Sidebar";
import "../styles/dashboard.css";

function DashboardLayout({ children }) {
  return (
    <div className="dash-shell">
      <Sidebar />
      <div className="dash-content">
        <main className="dash-main">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;