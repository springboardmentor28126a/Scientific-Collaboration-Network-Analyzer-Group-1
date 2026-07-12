import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children, allowedRoles }) {
  const { auth, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (auth?.must_reset_password && window.location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;