import Dashboard from "../components/dashboard/Dashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import FacultyDashboard from "../components/dashboard/FacultyDashboard";
import ReviewerDashboard from "../components/dashboard/ReviewerDashboard";
import InstitutionDashboard from "./InstitutionDashboard";

export default function DashboardHome() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (user?.role === "System Admin") return <AdminDashboard />;
    if (user?.role === "Faculty") return <FacultyDashboard />;
    if (user?.role === "Reviewer") return <ReviewerDashboard />;
    if (user?.role === "Institution Admin") return <InstitutionDashboard />;
    return <Dashboard />;

}
