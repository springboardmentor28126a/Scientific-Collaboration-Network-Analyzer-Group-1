import { Navigate } from "react-router-dom";
import { getAuthItem, getAuthUser } from "../utils/authStorage";

export default function ProtectedRoute({ children, allowedRoles }) {

    const token = getAuthItem("token");
    const user = getAuthUser();

    // Not logged in
    if (!token || !user) {

        return <Navigate to="/" replace />;

    }

    if (allowedRoles && user.role !== "System Admin" && !allowedRoles.includes(user.role)) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h1>403</h1>
                <p>You are not allowed to access this page.</p>
            </div>
        );
    }

    // System Admin bypasses verification
    if (user.role === "System Admin") {

        return children;

    }

    // Verified users
    if (user.is_verified || user.verification_status === "Approved") {

        return children;

    }

    // Pending Verification
    if (user.verification_status === "Pending") {

        return (
            <Navigate
                to="/verification-pending"
                replace
            />
        );

    }

    // Rejected Verification
    if (user.verification_status === "Rejected") {

        return (
            <Navigate
                to="/verification"
                replace
            />
        );

    }

    // Not Submitted
    return (
        <Navigate
            to="/verification"
            replace
        />
    );

}
