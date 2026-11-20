
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Wait until saved login information is checked
  if (loading) {
    return <p>Checking login...</p>;
  }

  // Redirect guests to login
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Allow logged-in users
  return children;
}

export default ProtectedRoute;
