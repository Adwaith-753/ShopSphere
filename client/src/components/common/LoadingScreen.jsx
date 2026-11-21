
import "./LoadingScreen.css";

function LoadingScreen({ message = "Loading ShopSphere..." }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">

        <div className="loading-logo">
          ShopSphere
        </div>

        <div className="loading-spinner"></div>

        <h2>{message}</h2>

        <p>Please wait while we prepare everything for you.</p>

      </div>
    </div>
  );
}

export default LoadingScreen;
