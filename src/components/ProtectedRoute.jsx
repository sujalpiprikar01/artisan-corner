import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, vendorOnly = false, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // User is not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only page
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Vendor-only page
  if (vendorOnly && user?.role !== "vendor") {
    return <Navigate to="/become-seller" replace />;
  }

  return children;
}

export default ProtectedRoute;