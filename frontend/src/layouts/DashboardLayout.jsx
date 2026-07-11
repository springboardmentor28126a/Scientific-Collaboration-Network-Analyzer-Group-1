import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

function DashboardLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">

      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="d-flex flex-grow-1">

        {/* Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content */}
        <main
          className="flex-grow-1 p-4"
          style={{
            background: "#F8FAFC",
          }}
        >
          {children}
        </main>

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default DashboardLayout;