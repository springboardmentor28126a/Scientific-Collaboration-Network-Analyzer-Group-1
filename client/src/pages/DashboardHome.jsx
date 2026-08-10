import Dashboard from "../components/dashboard/Dashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import FacultyDashboard from "../components/dashboard/FacultyDashboard";
import ReviewerDashboard from "../components/dashboard/ReviewerDashboard";
import InstitutionDashboard from "./InstitutionDashboard";
import { getAuthUser } from "../utils/authStorage";

export default function DashboardHome() {
    const user = getAuthUser();

    if (user?.role === "System Admin") return <AdminDashboard />;
    if (user?.role === "Faculty") return <FacultyDashboard />;
    if (user?.role === "Reviewer") return <ReviewerDashboard />;
    if (user?.role === "Institution Admin") return <InstitutionDashboard />;
    return <Dashboard />;

}
