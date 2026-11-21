
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext.jsx";
import { getMySellerApplication } from "../../services/sellerService";

import "./SellerCentre.css";

function SellerCentre() {
  const { user, token, loading } = useContext(AuthContext);

  const [application, setApplication] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchApplication = async () => {
      if (!token || !user) {
        setFetching(false);
        return;
      }

      try {
        setFetching(true);
        setError("");

        const data = await getMySellerApplication(token);

        if (isActive) {
          setApplication(data.application || null);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || "Unable to load application details.");
        }
      } finally {
        if (isActive) {
          setFetching(false);
        }
      }
    };

    fetchApplication();

    return () => {
      isActive = false;
    };
  }, [token, user]);

  if (loading || fetching) {
    return (
      <div className="seller-centre-loading">
        Loading Seller Centre...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="seller-centre-loading">
        Please log in to continue.
      </div>
    );
  }

  const status = application?.status;

  return (
    <div className="seller-centre-page">
      <div className="seller-centre-container">

        <Link to="/profile" className="seller-centre-back">
          <ArrowLeft size={18} />
          Back to Profile
        </Link>

        <div className="seller-centre-heading">
          <div className="seller-centre-icon">
            <Store size={32} />
          </div>

          <div>
            <h1>Seller Centre</h1>
            <p>
              Manage your ShopSphere seller application and store journey.
            </p>
          </div>
        </div>

        {error ? (
          <div className="seller-centre-card">
            <div className="seller-centre-error">
              <AlertCircle size={24} />
              <h2>Unable to load application</h2>
              <p>{error}</p>
            </div>
          </div>
        ) : !application ? (
          <div className="seller-centre-card">
            <div className="seller-centre-empty-icon">
              <Store size={38} />
            </div>

            <h2>Start Selling on ShopSphere</h2>

            <p>
              Open your own store, list your products and reach customers
              through ShopSphere.
            </p>

            <Link
              to="/seller-application"
              className="seller-centre-primary-btn"
            >
              Apply to Become a Seller
            </Link>
          </div>
        ) : status === "pending" ? (
          <div className="seller-centre-card">
            <div className="seller-centre-status-icon pending">
              <Clock size={36} />
            </div>

            <span className="seller-centre-status pending">
              Pending Review
            </span>

            <h2>Your Application Is Under Review</h2>

            <p>
              Thank you for applying to become a ShopSphere seller.
              Our admin team is reviewing your application.
            </p>

            <div className="seller-centre-details">
              <h3>Application Details</h3>

              <p>
                <strong>Store Name:</strong> {application.storeName}
              </p>

              <p>
                <strong>Seller Type:</strong> {application.sellerType}
              </p>

              <p>
                <strong>Category:</strong> {application.storeCategory}
              </p>

              <p>
                <strong>Submitted:</strong>{" "}
                {application.createdAt
                  ? new Date(application.createdAt).toLocaleDateString()
                  : "Not available"}
              </p>
            </div>

            <p className="seller-centre-note">
              You can check this page again later to see whether your
              application has been reviewed.
            </p>
          </div>
        ) : status === "approved" ? (
          <div className="seller-centre-card">
            <div className="seller-centre-status-icon approved">
              <CheckCircle size={36} />
            </div>

            <span className="seller-centre-status approved">
              Approved
            </span>

            <h2>Congratulations! Your Application Is Approved</h2>

            <p>
              Your ShopSphere seller application has been approved.
              You are ready to begin your seller journey.
            </p>

            <div className="seller-centre-details">
              <h3>Your Store</h3>

              <p>
                <strong>Store Name:</strong> {application.storeName}
              </p>

              <p>
                <strong>Category:</strong> {application.storeCategory}
              </p>
            </div>

            <p className="seller-centre-note">
              Open the Seller Dashboard to create and manage your products.
            </p>
          </div>
        ) : status === "rejected" ? (
          <div className="seller-centre-card">
            <div className="seller-centre-status-icon rejected">
              <XCircle size={36} />
            </div>

            <span className="seller-centre-status rejected">
              Rejected
            </span>

            <h2>Your Application Needs Changes</h2>

            <p>
              Unfortunately, your application was not approved.
              Please review the reason below and update your details.
            </p>

            <div className="seller-centre-rejection">
              <h3>Reason for Rejection</h3>

              <p>
                {application.rejectionReason ||
                  "No rejection reason was provided."}
              </p>
            </div>

            <Link
              to="/seller-application"
              className="seller-centre-primary-btn"
            >
              <RefreshCw size={18} />
              Update and Apply Again
            </Link>
          </div>
        ) : (
          <div className="seller-centre-card">
            <div className="seller-centre-empty-icon">
              <FileText size={38} />
            </div>

            <h2>Application Status Unavailable</h2>

            <p>
              We could not identify your current application status.
              Please contact support if this continues.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default SellerCentre;
