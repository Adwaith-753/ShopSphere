
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import LoadingScreen from "../components/common/LoadingScreen.jsx";

function SellerRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Preparing your seller workspace..." />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default SellerRoute;
