import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <main className="not-found-page">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you requested does not exist on ShopSphere.</p>
      <Link to="/">Return to Home</Link>
    </main>
  );
}

export default NotFound;
