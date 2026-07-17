import Sidebar from "./Sidebar";
import "../../styles/dashboard.css";

function DashboardShell({ title, subtitle, children }) {
  return (
    <div className="dash-shell">
      <Sidebar />
      <div className="dash-content">
        <header className="dash-pageheader">
          <div>
            <h1>{title}</h1>
            {subtitle && <p className="dash-pagesubtitle">{subtitle}</p>}
          </div>
        </header>
        <main className="dash-main">{children}</main>
      </div>
    </div>
  );
}

export default DashboardShell;