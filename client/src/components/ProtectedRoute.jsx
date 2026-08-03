import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    // Not logged in
    if (!token || !user) {

        return <Navigate to="/" replace />;

    }

    // System Admin bypasses verification
    if (user.role === "System Admin") {

        return children;

    }

    // Verified users
    if (user.is_verified) {

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